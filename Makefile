all: lib/obligate.js lib/obligate-apollo.js
clean: phony
	rm lib/*.js

lib/obligate.js: src/obligate.js.in
	./cpp_js src/obligate.js.in lib/obligate.js

lib/obligate-apollo.js: src/obligate.js.in
	./cpp_js -DAPOLLO src/obligate.js.in lib/obligate-apollo.js

0: phony all
	mkzero-gfxmonk -p obligate -p obligate-gather -p obligate-combine -p lib -v `cat VERSION` obligate.js.xml

test: phony all
	./example/test.sh

.PHONY: phony
