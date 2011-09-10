#Tartare.js
_contains the word "tar" twice!_

**Tartare is a simple javascript helper that allows you to write modular javascript, and serve it up to the browser in a `tar` file**

Organising and including all your javascript for a web pages is super lame. *especially* if you want to write javascript code that works both in a browser and in a server-side environment like node.js (wasn't that kind of the point of using javascript everywhere?)

Here's what you're going to do. You're going to write javascript just like you would (or do) for node.js:

1. add your module's top-level variables as members of the global `exports` object.
2. use `var mod = require("my/awesome/module")` when you need to use another module

Then, you make a `tar` file with all of your javascript (including folders, it's fine).

In your client-side code, include `tartare.js`.
Then, to initialize it:

	Tartare.install("path-to-0cache.tar", function() {
		// once this callback is triggered, `require` can load
		// any file from your dependencies, just as you would in node.
	};

Tada! Your code works in both node and the browser without doing anything special. Except of course you can't use any of node's builtin modules in the browser. I'm not [_crazy_][browserify], you know.

# The special sauce
_of an already twisted metaphor_

If you use [Zero Install][] (you _should_), you get all your dependencies bundled for free. Just:

1. make sure you have a zero install feed file for your app, including any dependencies
2. run [tartare-0bundle] <your-feed-file> and it'll combine everything from all of your dependencies that would end up on `$NODE_PATH` at runtime (this is configurable if you don't use `$NODE_PATH`)
3. `tar` it up and use as normal

#What the FAQ?

### Why don't you use a combiner / minifier?

Because then I have to write code differently depending on whether it executes server or client-side, and I have to manually specify every file that I need, from all of my dependencies.

### Why don't you use [some other javascript dependency mananger], it's great!

I already have an excellent dependency manager ([Zero Install][]) that works for any language, while most people who code in the same languages as I do use something like the set of `apt-get`, `npm`, `pip`, `setuptools`, `gem`, `cabal`, `ivy` and a whole bunch of manual steps because these tools can't handle anything out of their own language's domain. You really think we need _more_ dependency managers that can only do one thing?

### [node-browserify][browserify] already supports `require()` for browsers

I know, that's what prompted me to do this! It looks pretty big and complicated, and doesn't support Zero Install. but you should try it out if you like its features (it includes implementations of many builtin node libraries).

#Credits
 - Javascript tar implementation is thanks to [Ilmari Heikkinen][tar-js]
 - [Zero Install][] is great

[Zero Install]:    http://0install.net
[tartare-0bundle]: http://gfxmonk.net/dist/0install/tartare-0bundle.xml
[tar-js]:          http://fhtr.blogspot.com/2010_05_01_archive.html
[browserify]:      https://github.com/substack/node-browserify
