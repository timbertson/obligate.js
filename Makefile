proc="cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C"

all: tartare.js tartare-apollo.js

tartare.js: src/tartare.js
	${proc} src/tartare.js > tartare.js

tartare-apollo.js: src/tartare.js
	${proc} -DAPOLLO src/tartare.js > tartare.js

.PHONY: all
