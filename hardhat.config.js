require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    "tea-sepolia": {
      url: process.env.RPC_URL || "https://tea-sepolia.g.alchemy.com/public",
      chainId: 10218,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      "tea-sepolia": "empty", // atau token jika tersedia, bisa "abc123" kalau dikasih oleh explorer
    },
    customChains: [
      {
        network: "tea-sepolia",
        chainId: 10218,
        urls: {
          apiURL: "https://sepolia.tea.xyz/api",       // endpoint API untuk verifikasi
          browserURL: "https://sepolia.tea.xyz",       // URL explorer
        },
      },
    ],
  },
};
