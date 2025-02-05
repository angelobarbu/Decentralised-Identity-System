import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const IdentityForm = ({ contract, account, onClose, onSuccess, readOnly = false, identity = {} }) => {
  const [firstName, setFirstName] = useState(identity.firstName || "");
  const [lastName, setLastName] = useState(identity.lastName || "");
  const [dob, setDob] = useState(identity.dob || "");
  const [nationality, setNationality] = useState(identity.nationality || "");
  const [idNumber, setIdNumber] = useState(identity.idNumber || "");
  const [status, setStatus] = useState("");

  const issueIdentity = async () => {
    try {
      const formData = new FormData();
      formData.append("userAddress", account);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("dob", dob);
      formData.append("nationality", nationality);
      formData.append("idNumber", idNumber);

      const response = await axios.post("http://localhost:5001/identity/issue-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(response.data.message);
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
          {!readOnly && <button className="submit-btn" onClick={issueIdentity}>Submit</button>}
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>

        {status && <p className="status-message">{status}</p>}
      </div>
    </div>
  );
};

export default IdentityForm;
