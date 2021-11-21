const HDWalletProvider = require('truffle-hdwallet-provider');

const fs = require('fs');
const mnemonic = fs.readFileSync('.mnemonic').toString().trim();

// Infura: https://rinkeby.infura.io/v3/211cb4b90b18400aafece0d66f62c120
// Alchemy: https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH
const rinkebyURL = 'https://eth-rinkeby.alchemyapi.io/v2/0hNqd5zfmqjAkLuwmphxjg_v6gEaOkiH';

module.exports = {
  networks: {
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, rinkebyURL)
      },
      network_id: 4,
    },
  },

  mocha: {},
  compilers: {
    solc: {
      version: "0.8.9",
    },
  },
};
