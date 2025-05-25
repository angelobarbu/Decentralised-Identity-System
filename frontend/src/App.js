import React, { useContext } from "react";
import { BlockchainContext } from "./contexts/BlockchainContext";
import Dashboard from "./components/Dashboard";

const App = () => {
  const blockchain = useContext(BlockchainContext) || {}; // Prevents undefined error
  const {
    connected = false,
    connectWallet = () => {},
    disconnectWallet = () => {},
    contract = null,
    accounts = [],
  } = blockchain;

  return (
    <div className="container">
      {!connected ? (
        <div className="login-container">
          <h1>Connect to MetaMask</h1>
          <button className="connect-button" onClick={connectWallet}>Connect</button>
        </div>
      ) : (
        <Dashboard
          contract={contract}
          accounts={accounts}
          disconnectWallet={disconnectWallet}
        />
      )}
    </div>
  );
};

export default App;
