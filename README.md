#Obligate.js
_It's a synonym of `require`, did you know?_

**Obligate is a simple javascript helper that allows you to write modular javascript and serve it up to the browser effortlessly**

Organising and including all your javascript for a web pages is super lame. *especially* if you want to write javascript code that works both in a browser and in a server-side environment like node.js (wasn't that kind of the point of using javascript everywhere?)

Here's what you're going to do. You're going to write javascript just as you would (or do) for a [commonJS][] module system:

1. add your module's top-level variables as members of the global `exports` object.
2. use `var mod = require("my/awesome/module")` when you need to use another module

Then, you run `obligate combine [root-js-folder]` to create `obligate-modules.js` which now contains the code for *all* modules.

In your client-side code, include `lib/obligate.js`, followed by `obligate-modules.js`. Then, just run `Obligate.install()` to install obligate's `require` function.

Tada! Your code works in both node and the browser without doing anything special. Except of course you can't use any of node's builtin modules in the browser. I'm not [_crazy_][browserify], you know.

#The _obligatory_ integration
_of an already awkward metaphor_

If you use [Zero Install][0install] (you _should_!), you get all your dependencies included for free. Just:

1. run `obligate gather [your-feed-file]` and it'll create a `0cache` directory that combines everything from all of your dependencies (and your own app) that would end up on `$NODE_PATH` at runtime (this is configurable if you don't use `$NODE_PATH`)
2. run `obligate combine 0cache` as above.

#What the FAQ?

### Why don't you use [some other javascript dependency mananger], it's great!

I already have an excellent dependency manager ([Zero Install][0install]) that works for any language, while most people who code in the same languages as I do use something like the set of `apt-get`, `npm`, `pip`, `setuptools`, `gem`, `cabal`, `ivy` and a whole bunch of manual steps because these tools can't handle anything out of their own language's domain. You really think we need _more_ dependency managers that can only do one thing?

### [node-browserify][browserify] already supports `require()` for browsers

I know, that's what prompted me to do this! It looks pretty big and complicated though, and it uses `npm` (see above question for reasons that's bad). Obligate is tiny (less that 100 lines of javascript), and has simple (optional) integration with Zero Install. But you should try out browserify if you like its features (it includes implementations of many builtin node libraries).

### What's missing?

Relative requires don't work yet, and `index.js` isn't dealt with correctly. Patches welcome, the code is pretty simple.

[tartare-0bundle]: http://gfxmonk.net/dist/0install/tartare-0bundle.xml
[browserify]:      https://github.com/substack/node-browserify
[commonJS]:        http://www.commonjs.org/specs/modules/1.0/
[0install]:        http://0install.net/
