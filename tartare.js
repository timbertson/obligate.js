/*

MultiFile implementation Copyright (c) 2010 Ilmari Heikkinen
`require` integration Copyright (c) 2011 Tim Cuthbertson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {
  var global = this;
  if(typeof(exports) === 'undefined') {
    Tartare = {};
    var exports = Tartare;
  }
  var MultiFile = exports.MultiFile = function(){};

  // Load and parse archive, calls onload after loading all files.
  MultiFile.load = function(url, onload) {
    var o = new MultiFile();
    o.onload = onload;
    o.load(url);
    return o;
  }

  var filemap = {};

  exports.addArchiveAsync = function(url, cb) {
    MultiFile.load(url, function(files) {
      for(var i=0; i<files.length; i++) {
        var file = files[i];
        var filename = file.filename;
        if(filename.match(/\/$/)) continue; // ignore directory
        filename = cleanPath(filename);
        filemap[filename] = file.data;
      }
      cb();
    });
  };

  exports.addArchive = function(url) {
    waitfor() {
      exports.addArchiveAsync(url, resume);
    }
  };


  function cleanPath(path) {
    return path.replace(/^\.\//, ''); // strip leading './'
  };

  var oldRequire = function(file) {
    throw new Error("Could not require file: " + file);
  };

  exports.loaders = {
    'js': function(data) {
      var exports = {};
      eval(data);
      return exports;
    }

    ,'sjs': function(data) {
      var module = {
        exports: {}
      };
      var compile = require('sjs:apollo-sys').require.extensions.sjs;
      compile(data, module);
      return module.exports;
    }

  };

  // standalone require() impl, if you don't want to install() it
  var req = exports.require = function() {
    if(!req.modules[file]) {
      var data = tryLookup(file, extensions);
      if(!data) {
        return oldRequire.apply(this, arguments);
      }
      // eval data with an `exports` context:
      //TODO can't scope eval in JS. but we can do fakery like:
      //http://stackoverflow.com/questions/543533/restricting-eval-to-a-narrow-scope
      var contents = data[0];
      var file = data[1];
      var ext = file.split('.');
      ext = ext[ext.length-1];

      var loader = exports.loaders[ext];
      if(!loader) {
        throw new Error("no file loader defined for extension " + ext);
      }
      req.modules[file] = exports.loaders[];(function() {
        var exports = {};
        eval(contents);
        return exports;
      })();
    }
    return req.modules[file];
  };
  req.modules = {};

  function tryLookup(filename, extensions) {
    filename = cleanPath(filename);
    extensions = extensions || ["js"];
    function lookup(filename) {
      return filemap[filename];
    };
    var plain = lookup(filename);
    if(plain) {
      return [plain, filename];
    }
    for(var i=0; i<extensions.length; i++) {
      var extension = extensions[i];
      var filename_ext = filename + '.' + extension;
      var data = lookup(filename_ext);
      if(data) {
        return [data, filename_ext];
      }
    }
    return null;
  };

  exports.installAsync = function(tarfile, cb, extensions) {
    var existingRequire = global.require;
    if(existingRequire !== undefined) {
      oldRequire = existingRequire;
    }
    exports.addArchiveAsync(tarfile, function() {
      global.require = exports.require;
      cb();
    });
  };


  exports.install = function(tarfile, extensions) {
    waitfor() {
      exports.installAsync(tarfile, resume, extensions);
    }
  };


  exports.paths = function() {
    var paths = [];
    for(k in filemap) {
      if(filemap.hasOwnProperty(k)) {
        paths.push(k);
      }
    }
    return paths;
  };

  // Streams an archive from the given url, calling onstream after loading each file in archive.
  // Calls onload after loading all files.
  MultiFile.stream = function(url, onstream, onload) {
    var o = new MultiFile();
    o.onload = onload;
    o.onstream = onstream;
    o.load(url);
    return o;
  }
  MultiFile.prototype = {
    onerror : null,
    onload : null,
    onstream : null,

    load : function(url) {
      var xhr = new XMLHttpRequest();
      var self = this;
      var offset = 0;
      this.files = [];
      var isTar = (/\.tar(\?.*)?$/i).test(url);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200 || xhr.status == 0) {
            offset = self.processTarChunks(xhr.responseText, offset);
            if (self.onload) self.onload(self.files);
          } else {
            if (self.onerror) self.onerror(xhr);
          }
        } else if (xhr.readyState == 3) {
          if (xhr.status == 200 || xhr.status == 0) {
            offset = self.processTarChunks(xhr.responseText, offset);
          }
        }
      };
      xhr.open("GET", url, true);
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
      xhr.setRequestHeader("Content-Type", "text/plain");
      xhr.send(null);
    },

    onerror : function(xhr) {
      alert("Error: "+xhr.status);
    },

    cleanHighByte : function(s) {
      return s.replace(/./g, function(m) {
        return String.fromCharCode(m.charCodeAt(0) & 0xff);
      });
    },

    parseTar : function(text) {
      this.files = [];
      this.processTarChunks(text, 0);
    },
    processTarChunks : function (responseText, offset) {
      while (responseText.length >= offset + 512) {
        var header = this.files.length == 0 ? null : this.files[this.files.length-1];
        if (header && header.data == null) {
          if (offset + header.length <= responseText.length) {
            header.data = responseText.substring(offset, offset+header.length);
            offset += 512 * Math.ceil(header.length / 512);
            if (this.onstream) this.onstream(header);
          } else { // not loaded yet
            break;
          }
        } else {
          var header = this.parseTarHeader(responseText, offset);
          if (header.length > 0 || header.filename != '') {
            this.files.push(header);
            offset += 512;
            header.offset = offset;
          } else { // empty header, stop processing
            offset = responseText.length;
          }
        }
      }
      return offset;
    },
    parseTarHeader : function(text, offset) {
      var i = offset || 0;
      var h = {};
      h.filename = text.substring(i, i+=100).split("\0", 1)[0];
      h.mode = text.substring(i, i+=8).split("\0", 1)[0];
      h.uid = text.substring(i, i+=8).split("\0", 1)[0];
      h.gid = text.substring(i, i+=8).split("\0", 1)[0];
      h.length = this.parseTarNumber(text.substring(i, i+=12));
      h.lastModified = text.substring(i, i+=12).split("\0", 1)[0];
      h.checkSum = text.substring(i, i+=8).split("\0", 1)[0];
      h.fileType = text.substring(i, i+=1).split("\0", 1)[0];
      h.linkName = text.substring(i, i+=100).split("\0", 1)[0];
      return h;
    },
    parseTarNumber : function(text) {
      // if (text.charCodeAt(0) & 0x80 == 1) {
      // GNU tar 8-byte binary big-endian number
      // } else {
        return parseInt('0'+text.replace(/[^\d]/g, ''));
      // }
    }
  }
}).call(this);
