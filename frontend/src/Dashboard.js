import React, { useState, useEffect } from "react";
import axios from "axios";
import IdentityForm from "./IdentityForm";
import "./App.css";

const Dashboard = ({ contract, accounts, disconnectWallet }) => {
  const [identities, setIdentities] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewingIdentity, setViewingIdentity] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [revokePopup, setRevokePopup] = useState({ show: false, identity: null });

  useEffect(() => {
    if (contract && accounts.length > 0) {
      loadIdentities(accounts[0]);
    }
  }, [contract, accounts]);

  const loadIdentities = async (userAddress) => {
    try {
      const response = await axios.get(`http://localhost:5001/identity/get-identities/${userAddress}`);
      console.log("Identities:", response.data.credentials);
      setIdentities(response.data.credentials);
    } catch (error) {
      showNotification("Error fetching identities.", "error");
    }
  };

  const confirmRevoke = (identity) => {
    setRevokePopup({ show: true, identity });
  };

  const revokeIdentity = async () => {
    try {
      const { identity } = revokePopup;
      await axios.post("http://localhost:5001/identity/revoke-identity", {
        userAddress: accounts[0],
        firstName: identity.firstName,
        lastName: identity.lastName,
        dob: identity.dob,
        nationality: identity.nationality,
        idNumber: identity.idNumber,
      });
      showNotification(`Identity for ${identity.firstName} ${identity.lastName} revoked successfully.`, "success");
      loadIdentities(accounts[0]);
    } catch (error) {
      showNotification("Error revoking identity.", "error");
    } finally {
      setRevokePopup({ show: false, identity: null });
    }
  };

  const showNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  const handleIdentitySuccess = (message) => {
    showNotification(message, "success");
    loadIdentities(accounts[0]);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="account-info">
          <span className="account-label">Account</span>
          <span className="account-address">
            {accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}
          </span>
        </div>
        <div className="meta-actions">
          <span className="metamask-status">Connected - MetaMask</span>
          <button className="disconnect-btn" onClick={disconnectWallet}>Disconnect</button>
        </div>
      </div>

      <div className="identities-container">
        <div className="identities-header">
          <h2>Identities</h2>
          <button className="add-identity-btn" onClick={() => setShowModal(true)}>+</button>
        </div>

        {identities.length > 0 ? (
          <ul className="identity-list">
            {identities.map((id, index) => (
              <li key={index} className="identity-item">
                <span className="identity-name">{id.firstName} {id.lastName}</span>
                <div className="identity-actions">
                  <button className="view-btn" onClick={() => setViewingIdentity(id)}>View</button>
                  <button className="revoke-btn" onClick={() => confirmRevoke(id)}>Revoke</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-identities">No identities found.</p>
        )}
      </div>

      {showModal && (
        <IdentityForm
          contract={contract}
          account={accounts[0]}
          onClose={() => setShowModal(false)}
          onSuccess={handleIdentitySuccess}
        />
      )}

      {viewingIdentity && (
        <IdentityForm
          contract={contract}
          account={accounts[0]}
          onClose={() => setViewingIdentity(null)}
          readOnly={true}
          identity={viewingIdentity}
        />
      )}

      {revokePopup.show && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Revocation</h2>
            <p>Are you sure you want to revoke the identity for <strong>{revokePopup.identity.firstName} {revokePopup.identity.lastName}</strong>?</p>
            <div className="popup-buttons">
              <button className="confirm-revoke-btn" onClick={revokeIdentity}>Revoke</button>
              <button className="cancel-btn" onClick={() => setRevokePopup({ show: false, identity: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="notification-container">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;