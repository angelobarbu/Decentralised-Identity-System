import React, { useState, useEffect } from "react";
import { fetchIdentities, revokeIdentity } from "../services/identityService";
import IdentityForm from "./IdentityForm";
import { showNotification } from "../utils/notifications";


const Dashboard = ({ contract, accounts, disconnectWallet }) => {
  const [identities, setIdentities] = useState([]);
  const [filteredIdentities, setFilteredIdentities] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewingIdentity, setViewingIdentity] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [revokePopup, setRevokePopup] = useState({ show: false, identity: null });

  useEffect(() => {
    if (contract && accounts.length > 0) {
      setSelectedAccounts(accounts); // Select all accounts by default
      loadIdentities(accounts);
    }
  }, [contract, accounts]);

  const loadIdentities = async (userAccounts) => {
    try {
      const data = await fetchIdentities(userAccounts);
      setIdentities(data);
      setFilteredIdentities(data);
    } catch (error) {
      showNotification(setNotifications, "Error fetching identities.", "error");
    }
  };

  const toggleAccountSelection = (account) => {
    const updatedSelection = selectedAccounts.includes(account)
      ? selectedAccounts.filter(acc => acc !== account)
      : [...selectedAccounts, account];

    setSelectedAccounts(updatedSelection);
    updateFilteredIdentities(updatedSelection);
  };

  const updateFilteredIdentities = (activeAccounts) => {
    setFilteredIdentities(activeAccounts.length > 0
      ? identities.filter(identity => activeAccounts.includes(identity.userAddress))
      : []);
  };

  const confirmRevoke = (identity) => {
    setRevokePopup({ show: true, identity });
  };

  const revokeIdentityHandler = async () => {
    try {
      const { identity } = revokePopup;
      await revokeIdentity(identity);
      showNotification(setNotifications, `Identity ${identity.firstName} ${identity.lastName} revoked successfully!`, "success");
      loadIdentities(accounts);
    } catch (error) {
      showNotification(setNotifications, "Error revoking identity.", "error");
    } finally {
      setRevokePopup({ show: false, identity: null });
    }
  };

  const handleIdentitySuccess = (message) => {
    showNotification(setNotifications, message, "success");
    loadIdentities(accounts);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="account-selection">
          <span className="account-label">Accounts Connected:</span>
          <ul className="account-list">
            {accounts.map((acc) => (
              <li
                key={acc}
                className={`account-item ${selectedAccounts.includes(acc) ? "selected" : ""}`}
                onClick={() => toggleAccountSelection(acc)}
              >
                {acc.slice(0, 6)}...{acc.slice(-4)}
              </li>
            ))}
          </ul>
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

        {filteredIdentities.length > 0 ? (
          <ul className="identity-list">
            {filteredIdentities.map((id, index) => (
              <li key={index} className="identity-item">
                <span className="identity-name">
                  {id.firstName} {id.lastName} <span className="identity-address">{id.userAddress.slice(0, 6)}...{id.userAddress.slice(-4)}</span>
                </span>
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
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onSuccess={handleIdentitySuccess}
        />
      )}

      {viewingIdentity && (
        <IdentityForm
          contract={contract}
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
              <button className="confirm-revoke-btn" onClick={revokeIdentityHandler}>Revoke</button>
              <button className="cancel-btn" onClick={() => setRevokePopup({ show: false, identity: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="notification-container">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id} className={`notification ${notif.type}`}>
              {notif.message}
            </div>
          ))
        ) : null}
      </div>

    </div>
  );
};

export default Dashboard;
