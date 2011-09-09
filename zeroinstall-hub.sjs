function get_file(path) {
	var contents;
	if(require('sjs:apollo-sys').hostenv == 'xbrowser') {
		contents = require('apollo:http').get(cache_path);
	} else {
		contents = require("apollo:node-fs").readFile(path);
	}
	return contents;
}

function indexedResolver(index, base) {
	return function(uri, rel_path) {
		var cache_dir = index[uri];
		if(!cache_dir) {
			throw new Error("No 0install cache dir found for " + uri);
		}
		var cache_path = cache_dir + "/" + rel_path;
		return base + "/" + cache_path;
	};
};

function resolveURI(uri) {
	var child_proc = require('apollo:node-child-process');
	// var cmd = ['0launch', '--console', 'TODO::URL', '--list'];
	var cmd = ['./js-0bundle', '--list'];
	cmd.push(uri);
	var output = child_proc.run(cmd[0], cmd.slice(1));
	return JSON.parse(output.stdout);
};

function fileMapLookup(map) {
	// lookup map is of the form:
	// {
	//    uri1: [base1, base2, ...]
	//    uri2: [base1, base2, ...]
	//    ...
	// }
	var collection = require('apollo:collection');
	var fs = require("apollo:node-fs");
	return function lookup(uri, rel_path) {
		var found = null;
		collection.find(map, function(bases, uri) {
			if(uri != uri) return;
			return collection.find(bases, function(base) {
				var full_path = require("path").join(base, rel_path);
				if(fs.isFile(full_path)) {
					found = full_path;
					return true;
				}
			});
		});
		if(!found) throw new Error("Couldn't find path for " + uri + "#" + rel_path);
		return found;
	};
}

function developmentResolver(uri, rel_path) {
	// NOT recommended for anything but dev work - it can block indefinitely
	// on certain input
	var fileMap = resolveURI(uri);
	return fileMapLookup(fileMap)(uri, rel_path);
};

exports.install = function(opts) {
	opts = opts || {}
	var base = opts.base || "/0cache";
	var devmode = opts.dev;
	var path_resolver;
	if(devmode) {
		path_resolver = developmentResolver;
	} else {
		var index = opts.index || JSON.parse(get_file(base + '/index.json'));
		path_resolver = indexedResolver(index, base);
	}
	var tarfile = opts.tar || false;
	//TODO: implement tarfile support
	
	function load(path) {
		path = path.replace(/^[^:]*:/, '');
		var parts = path.split("#");
		var cache_path = path_resolver.apply(null, parts);
		var contents = get_file(cache_path);
		return {
			src:contents,
			file:cache_path
		};
	};
	require.hubs.push(['0install:', {src:load}]);
};
