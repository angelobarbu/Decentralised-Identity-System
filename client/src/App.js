import React, { useState, useEffect } from 'react';
import getBlockchain from './Blockchain';
import './App.css';

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [identityContract, setIdentityContract] = useState(null);
  const [dataHash, setDataHash] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { web3, contract, accounts } = await getBlockchain();
        setAccounts(accounts);
        setIdentityContract(contract);
      } catch (error) {
        setError(error.message);
      }
    };
    init();
  }, []);

  const issueCredential = async () => {
    try {
      await identityContract.methods.issueCredential(accounts[0], dataHash).send({ from: accounts[0] });
      setStatus('Credential Issued');
    } catch (error) {
      setError(error.message);
    }
  };

  const verifyCredential = async () => {
    try {
      const isValid = await identityContract.methods.verifyCredential(accounts[0], dataHash).call();
      setStatus(isValid ? 'Credential is valid' : 'Credential is invalid');
    } catch (error) {
      setError(error.message);
    }
  };

  const revokeCredential = async () => {
    try {
      await identityContract.methods.revokeCredential(accounts[0], dataHash).send({ from: accounts[0] });
      setStatus('Credential Revoked');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      <h1>Decentralized Identity Verification</h1>
      <input
        type="text"
        value={dataHash}
        onChange={(e) => setDataHash(e.target.value)}
        placeholder="Data Hash"
      />
      <button onClick={issueCredential}>Issue Credential</button>
      <button onClick={verifyCredential}>Verify Credential</button>
      <button onClick={revokeCredential}>Revoke Credential</button>
      <p>{status}</p>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default App;
