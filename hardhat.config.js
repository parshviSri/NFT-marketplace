require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
const privateKey= fs.readFileSync('.secret').toString();

module.exports = {
  networks:{
    hardhat:{
      chainId:1337
    },
    mumbai:{
      url:"https://polygon-mumbai.infura.io/v3/797464e9778e4e09a9bea7dd67d8a2c7",
      accounts: [privateKey]
    },
    mainnet:{
      url: "https://polygon-mainnet.infura.io/v3/797464e9778e4e09a9bea7dd67d8a2c7",
      accounts: [privateKey]
    }
  },
  solidity: "0.8.4",
};
