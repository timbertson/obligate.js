all:
	@gup all

test: phony all
	./example/test.sh

.PHONY: phony all
