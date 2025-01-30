import React, { useState, useEffect } from "react";
import axios from "axios";
import IdentityForm from "./IdentityForm";

const Dashboard = ({ contract, accounts, disconnectWallet }) => {
  const [identities, setIdentities] = useState([]);
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (contract && accounts.length > 0) {
      loadIdentities(accounts[0]);
    }
  }, [contract, accounts]);

  const loadIdentities = async (userAddress) => {
    try {
      const response = await axios.get(`http://localhost:5001/get-identities/${userAddress}`);
      setIdentities(response.data.credentials);
    } catch (error) {
      setStatus("Error fetching identities.");
    }
  };

  const deleteIdentity = async (dataHash) => {
    try {
      await contract.methods.revokeCredential(accounts[0], dataHash).send({ from: accounts[0] });
      setStatus("Identity revoked successfully.");
      loadIdentities(accounts[0]);
    } catch (error) {
      setStatus("Error revoking identity.");
    }
  };

  return (
    <div className="container">
      <h1>Your Digital Identities</h1>
      <p>MetaMask Connected: {accounts[0]}</p>
      <button className="disconnect" onClick={disconnectWallet}>Disconnect</button>
      <button className="add-identity" onClick={() => setShowModal(true)}>Add Identity</button>
      
      <p>{status}</p>
      {identities.length > 0 ? (
        <ul>
          {identities.map((id, index) => (
            <li key={index}>
              {id.dataHash}
              <button onClick={() => deleteIdentity(id.dataHash)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No identities found.</p>
      )}

      {showModal && (
        <IdentityForm
          contract={contract}
          account={accounts[0]}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
