deploy:
	truffle migrate --network rinkeby

.PHONY: build
build:
	truffle compile
	node export-abi.js
