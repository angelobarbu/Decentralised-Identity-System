import React, { useEffect, useState } from "react";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import { fetchIdentities } from "./services/identityService";
import Web3 from "web3";

const ChooserInner = () => {
  const [identities, setIdentities] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const accs = await web3.eth.getAccounts();
      const creds = await fetchIdentities(accs);
      setIdentities(creds);
    })();
  }, []);

  const sendAndClose = async () => {
    if (!selected) return;
    const web3 = new Web3(window.ethereum);
    const msg = JSON.stringify(selected);
    const signature = await web3.eth.personal.sign(msg, selected.userAddress);

    const params        = new URLSearchParams(window.location.search);
    const openerOrigin  = params.get("origin") || "*";   // fallback for dev

    window.opener.postMessage(
    { credential: { payload: selected, signature } },
      openerOrigin
    );
    window.close();
  };

  return (
    <div className="chooser-container">
      <h1 className="chooser-title">Select an identity</h1>

      {identities.map((id) => (
        <div
          key={id.credentialId}
          className={`identity-card ${selected === id ? "selected" : ""}`}
          onClick={() => setSelected(id)}
        >
          <span className="identity-name">
            {id.firstName} {id.lastName}
            <span className="identity-address">
              {id.userAddress.slice(0, 6)}…{id.userAddress.slice(-4)}
            </span>
          </span>
        </div>
      ))}

      {identities.length === 0 && (
        <p style={{ marginBottom: "1rem" }}>No identities found for connected wallet.</p>
      )}

      <button
        className="continue-btn"
        disabled={!selected}
        onClick={sendAndClose}
      >
        Continue
      </button>
    </div>
  );
};

export default function Chooser() {
  return (
    <BlockchainProvider>
      <ChooserInner />
    </BlockchainProvider>
  );
}
