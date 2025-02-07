import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const IdentityForm = ({ contract, account, onClose, onSuccess, readOnly = false, identity = {} }) => {
  const [firstName, setFirstName] = useState(identity.firstName || "");
  const [lastName, setLastName] = useState(identity.lastName || "");
  const [dob, setDob] = useState(identity.dob || "");
  const [nationality, setNationality] = useState(identity.nationality || "");
  const [idNumber, setIdNumber] = useState(identity.idNumber || "");
  const [status, setStatus] = useState("");
  const [revalidatePopup, setRevalidatePopup] = useState({ show: false, formData: null });

  const issueIdentity = async (revalidate = false) => {
    try {
      const formData = {
        userAddress: account,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber,
        revalidate
      };

      console.log("Issuing identity:", formData);

      const response = await axios.post("http://localhost:5001/identity/issue-identity", formData);

      console.log("Identity issued:", response.data, response.data.revalidationRequired);

      if (response.data.message === "Credential exists but is revoked. Set revalidate to true to revalidate it.") {
        // Show the revalidation popup if required
        setRevalidatePopup({ show: true, formData });
        return;
      }

      setStatus("Identity issued successfully!");
      onSuccess("Identity issued successfully!");
      onClose();

    } catch (error) {
      setStatus("Error issuing identity.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{readOnly ? "View Identity" : "Add Identity"}</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        <input
          type="text"
          placeholder="Nationality"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        <input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />

        <div className="form-buttons">
          {!readOnly && <button className="submit-btn" onClick={() => issueIdentity(false)}>Submit</button>}
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>

        {status && <p className="status-message">{status}</p>}

        {/* Revalidation Popup */}
        {revalidatePopup.show && (
          <div className="modal">
            <div className="modal-content">
              <h2>Identity Already Exists</h2>
              <p>The identity <strong>{revalidatePopup.formData.firstName} {revalidatePopup.formData.lastName}</strong> was previously revoked. Do you want to revalidate it?</p>
              <div className="popup-buttons">
                <button className="confirm-revalidate-btn" onClick={() => issueIdentity(true)}>Revalidate</button>
                <button className="cancel-btn" onClick={() => setRevalidatePopup({ show: false, formData: null })}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityForm;
