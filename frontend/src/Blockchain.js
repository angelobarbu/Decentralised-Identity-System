import Web3 from "web3";
import Identity from "./contracts/Identity.json";

const getBlockchain = async () => {
  if (!window.ethereum) {
    throw new Error("No Ethereum provider detected.");
  }

  

  // Ensure MetaMask is used instead of Phantom
  let provider;
  if (window.ethereum.providers) {
    provider = window.ethereum.providers.find((p) => p.isMetaMask);
  } else {
    provider = window.ethereum.isMetaMask ? window.ethereum : null;
  }

  if (!provider) {
    throw new Error("MetaMask is not installed or not detected.");
  }

  const web3 = new Web3(provider);

  try {
    await provider.request({ method: "eth_requestAccounts" });

    // Force switch network
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x539" }], // 1337 in hex (Ganache default)
    });

    const networkId = await web3.eth.net.getId();
    console.log("Connected Network ID:", networkId); // Debugging

    const deployedNetwork = Identity.networks[networkId];

    if (!deployedNetwork || !deployedNetwork.address) {
      throw new Error(`Smart contract not deployed on network ID ${networkId}.`);
    }

    const contract = new web3.eth.Contract(Identity.abi, deployedNetwork.address);
    const accounts = await web3.eth.getAccounts();

    console.log("Smart Contract Address:", deployedNetwork.address);
    console.log("User Accounts:", accounts);

    return { web3, contract, accounts };
  } catch (error) {
    console.error("Failed to load Web3:", error.message);
    throw new Error(`Failed to load Web3: ${error.message}`);
  }
};

export default getBlockchain;
