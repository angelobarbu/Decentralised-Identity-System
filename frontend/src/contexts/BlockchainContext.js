import React, { createContext } from "react";
import useBlockchain from "../hooks/useBlockchain";

export const BlockchainContext = createContext({
  connected: false,
  accounts: [],
  contract: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export const BlockchainProvider = ({ children }) => {
  const blockchain = useBlockchain();
  return <BlockchainContext.Provider value={blockchain}>{children}</BlockchainContext.Provider>;
};
