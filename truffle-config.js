const HDWalletProvider = require("@truffle/hdwallet-provider");
const dotenv = require('dotenv');
const path = require("path");

dotenv.config();

module.exports = {
  plugins: ["solidity-coverage"],
  //contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ropsten: {
      provider: function() { return new HDWalletProvider({ mnemonic: { phrase: `${process.env.MNEMONIC}` }, providerOrUrl: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}` }) },
      network_id: 3,
    },
    rinkeby: {
      provider: function () { return new HDWalletProvider({ mnemonic: { phrase: `${process.env.MNEMONIC}` }, providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}` }) },
      network_id: 4,
    },
    kovan: {
        provider: function() { return new HDWalletProvider({ mnemonic: { phrase: `${process.env.MNEMONIC}` }, providerOrUrl: `https://kovan.infura.io/v3/${process.env.INFURA_ID}` }) },
        network_id: 42,
    },
  },

  mocha: {
    reporter: 'eth-gas-reporter',
    reporterOptions: {
      gasPrice: 1,
      token: 'ETH',
    },
  },

  compilers: {
    solc: {
      version: "0.8.13",
    }
  },
};
