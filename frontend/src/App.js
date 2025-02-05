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
      localStorage.setItem("connected", "true");
      localStorage.setItem("account", accounts[0]);
    } catch (error) {
      alert("Error connecting to MetaMask: " + error.message);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setConnected(false);
    localStorage.removeItem("connected");
    localStorage.removeItem("account");
    window.location.reload();
  };

  useEffect(() => {
    const isConnected = localStorage.getItem("connected");
    const storedAccount = localStorage.getItem("account");

    if (isConnected === "true" && storedAccount) {
      const reconnect = async () => {
        try {
          const { contract, accounts } = await getBlockchain();
          setAccounts(accounts);
          setIdentityContract(contract);
          setConnected(true);
        } catch (error) {
          console.error("Failed to reconnect:", error);
        }
      };
      reconnect();
    }
  }, []);

  return (
    <div className="container">
      {!connected ? (
        <div className="login-container">
          <h1>Connect to MetaMask</h1>
          <button className="connect-button" onClick={connectWallet}>Connect</button>
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
