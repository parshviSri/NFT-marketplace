require("@nomiclabs/hardhat-waffle");

module.exports = {
  networks:{
    hardhat:{
      chainId:1337
    },
    mumbai:{
      url:"https://polygon-mumbai.infura.io/v3/797464e9778e4e09a9bea7dd67d8a2c7",
      accounts: ['6d5a18e475bec4bf8ff4c6105b3a6b6a32d0a2737b4c5bb9796beb8d05def2e8']
    },
    mainnet:{
      url: "https://polygon-mainnet.infura.io/v3/797464e9778e4e09a9bea7dd67d8a2c7",
      accounts: ['6d5a18e475bec4bf8ff4c6105b3a6b6a32d0a2737b4c5bb9796beb8d05def2e8']
    }
  },
  solidity: "0.8.4",
};
