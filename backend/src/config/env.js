require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const config = {
  CONTRACT_ADDRESS: process.env.DEPLOYED_CONTRACT_ADDRESS,
  GANACHE_RPC_URL: process.env.GANACHE_RPC_URL,
  PORT: process.env.PORT,
  OCR_API_KEY: process.env.OCR_API_KEY,
  SECRET_KEY: process.env.SECRET_KEY,
};

module.exports = config;
