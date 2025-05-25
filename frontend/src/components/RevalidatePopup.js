import React from "react";

const RevalidatePopup = ({ message, show, onClose, onRevalidate }) => {
  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Identity Notification</h2>
        <p>{message}</p>

        <div className="popup-buttons">
          {onRevalidate && (
            <button className="confirm-revalidate-btn" onClick={onRevalidate}>
              Revalidate
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default RevalidatePopup;
