import React, { useState, useEffect } from "react";
import getBlockchain from "./Blockchain";
import "./App.css";
import Dashboard from "./Dashboard";

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [identityContract, setIdentityContract] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const { contract, accounts } = await getBlockchain();
      setAccounts(accounts);
      setIdentityContract(contract);
      setConnected(true);
      localStorage.setItem("connected", "true"); // Store connection state
    } catch (error) {
      alert("Error connecting to MetaMask: " + error.message);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setConnected(false);
    localStorage.removeItem("connected"); // Clear connection state
    window.location.reload(); // Refresh to go back to connection screen
  };

  useEffect(() => {
    const isConnected = localStorage.getItem("connected");
    if (isConnected === "true") {
      setConnected(true);
    }
  }, []);

  return (
    <div className="container">
      {!connected ? (
        <div className="login">
          <h1>Connect to MetaMask</h1>
          <button onClick={connectWallet}>Connect</button>
        </div>
      ) : (
        <Dashboard
          contract={identityContract}
          accounts={accounts}
          disconnectWallet={disconnectWallet}
        />
      )}
    </div>
  );
};

export default App;
