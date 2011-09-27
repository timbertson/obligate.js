all: obligate-modules.js obligate-modules-apollo.js
0cache: phony
	0launch http://gfxmonk.net/dist/0install/obligate.js.xml gather example.xml

obligate-modules.js: 0cache phony
	0launch http://gfxmonk.net/dist/0install/obligate.js.xml combine -o obligate-modules.js 0cache

obligate-modules-apollo.js: 0cache phony
	0launch http://gfxmonk.net/dist/0install/obligate.js.xml combine --apollo -o obligate-modules-apollo.js 0cache

.PHONY: phony
