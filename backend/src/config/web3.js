const Web3 = require("web3");
const Identity = require("../contracts/Identity.json");
const config = require("./env");

console.log("Using RPC URL:", config.GANACHE_RPC_URL);
console.log("Deployed Contract Address:", config.CONTRACT_ADDRESS);

const web3 = new Web3(config.GANACHE_RPC_URL);

if (!config.CONTRACT_ADDRESS || config.CONTRACT_ADDRESS === "undefined") {
  throw new Error("Contract address is undefined! Check your .env file.");
}

const identityContract = new web3.eth.Contract(Identity.abi, config.CONTRACT_ADDRESS);

// Debug ABI:
console.log("Identity Contract ABI Loaded:", Identity.abi.length, "methods");

module.exports = { web3, identityContract };
