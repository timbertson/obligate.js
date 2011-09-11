/*
Copyright (c) 2011 Tim Cuthbertson

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

//TODO:
// - support relative require()s
// - support index.js directory-style modules

(function() {
	var global = this;
	if(typeof(exports) === 'undefined') {
		Obligate = {};
		var exports = Obligate;
	}

	var extensions=['js'];
	var filemap = {};
	exports.def = function defineModuleLoader(path, fn) {
		filemap[path] = fn;
	};

	var oldRequire = function(file) {
		throw new Error("Could not find file: " + file);
	};

	// standalone require() impl, if you don't want to install() it
	var req = exports.require = function(file) {
		if(!req.modules[file]) {
			var loader = tryLookup(file, extensions);
			if(!loader) {
				return oldRequire.apply(this, arguments);
			}
			var exports = req.modules[file] = {};
			loader(exports);
		}
		return req.modules[file];
	};
	req.modules = {};

	function tryLookup(filename) {
		function lookup(filename) {
			return filemap[filename];
		};
		var plain = lookup(filename);
		if(plain) {
			return plain;
		}
		for(var i=0; i<extensions.length; i++) {
			var extension = extensions[i];
			var filename_ext = filename + '.' + extension;
			var data = lookup(filename_ext);
			if(data) {
				return data;
			}
		}
		return null;
	};

	exports.install = function(extensionsOverride) {
		var existingRequire = global.require;
		if(existingRequire !== undefined) {
			oldRequire = existingRequire;
		}
		if(extensionsOverride) {
			extensions = extensionsOverride;
		}
		global.require = exports.require;
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
}).call(this);
