import { useState, useEffect } from "react";
import getBlockchain from "../Blockchain";

const useBlockchain = () => {
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = async () => {
    try {
      const { contract, accounts } = await getBlockchain();
      setAccounts(accounts);
      setContract(contract);
      setConnected(true);
      localStorage.setItem("connected", "true");
      localStorage.setItem("accounts", accounts);
    } catch (error) {
      alert("Error connecting to MetaMask: " + error.message);
    }
  };

  const disconnectWallet = () => {
    setAccounts([]);
    setContract(null);
    setConnected(false);
    localStorage.removeItem("connected");
    localStorage.removeItem("accounts");
    window.location.reload();
  };

  useEffect(() => {
    const isConnected = localStorage.getItem("connected");
    const storedAccounts = localStorage.getItem("accounts");

    if (isConnected === "true" && storedAccounts.length > 0) {
      const reconnect = async () => {
        try {
          const { contract, accounts } = await getBlockchain();
          setAccounts(accounts);
          setContract(contract);
          setConnected(true);
        } catch (error) {
          console.error("Failed to reconnect:", error);
        }
      };
      reconnect();
    }
  }, []);

  return { contract, accounts, connected, connectWallet, disconnectWallet };
};

export default useBlockchain;
