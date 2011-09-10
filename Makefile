all: tartare.js tartare-apollo.js

tartare.js: src/tartare.js
	cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C src/tartare.js > tartare.js

tartare-apollo.js: src/tartare.js
	cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C -DAPOLLO src/tartare.js > tartare-apollo.js

.PHONY: all
