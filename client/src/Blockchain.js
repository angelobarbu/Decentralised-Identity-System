import Web3 from 'web3';
import Identity from './contracts/Identity.json';

const getBlockchain = () =>
  new Promise((resolve, reject) => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = Identity.networks[networkId];
          if (deployedNetwork) {
            const contract = new web3.eth.Contract(
              Identity.abi,
              deployedNetwork && deployedNetwork.address,
            );
            const accounts = await web3.eth.getAccounts();
            resolve({ web3, contract, accounts });
          } else {
            reject('Contract not deployed on the detected network.');
          }
        } catch (error) {
          reject(error);
        }
      } else {
        reject('Install Metamask');
      }
    });
  });

export default getBlockchain;
