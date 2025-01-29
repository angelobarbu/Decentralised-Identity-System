import Web3 from 'web3';
import Identity from './contracts/Identity.json';

const getBlockchain = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  const web3 = new Web3(window.ethereum);
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request access to accounts

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = Identity.networks[networkId];

    if (!deployedNetwork) {
      throw new Error('Smart contract not deployed on the detected network.');
    }

    const contract = new web3.eth.Contract(Identity.abi, deployedNetwork.address);
    const accounts = await web3.eth.getAccounts();

    return { web3, contract, accounts };
  } catch (error) {
    throw new Error(`Failed to load Web3: ${error.message}`);
  }
};

export default getBlockchain;

