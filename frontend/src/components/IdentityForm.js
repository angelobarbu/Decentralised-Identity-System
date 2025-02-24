import React, { useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { issueIdentity } from "../services/identityService";
import { showNotification } from "../utils/notifications";
import "../styles.css";

const IdentityForm = ({ contract, accounts, onClose, onSuccess, readOnly = false, identity = {} }) => {
  const [userAddress, setUserAddress] = useState(identity.userAddress || "");
  const [firstName, setFirstName] = useState(identity.firstName || "");
  const [lastName, setLastName] = useState(identity.lastName || "");
  const [dob, setDob] = useState(identity.dob || "");
  const [nationality, setNationality] = useState(identity.nationality || "");
  const [idNumber, setIdNumber] = useState(identity.idNumber || "");
  const [status, setStatus] = useState("");
  const [revalidatePopup, setRevalidatePopup] = useState({ show: false, formData: null });

  // Get list of all countries
  const nationalityOptions = countryList().getData();

  // Account dropdown options
  let accountOptions = [];
  if (!readOnly) {
    accountOptions = accounts.map(acc => ({
      value: acc,
      label: `${acc.slice(0, 6)}...${acc.slice(-4)}`
    }));
  } else {
    accountOptions = [{ value: identity.userAddress, label: `${identity.userAddress.slice(0, 6)}...${identity.userAddress.slice(-4)}` }];
  }

  const handleIssueIdentity = async (revalidate = false) => {
    try {
      const formData = {
        userAddress,
        firstName,
        lastName,
        dob,
        nationality,
        idNumber,
        revalidate
      };

      console.log("Issuing identity:", formData);
      const response = await issueIdentity(formData);
      console.log("Identity issued:", response.data);

      // Handle revalidation scenario
      if (response.data.message === "Credential exists but is revoked. Set revalidate to true to revalidate it.") {
        setRevalidatePopup({ show: true, formData });
        return;
      }

      showNotification(setStatus, "Identity issued successfully!", "success");
      onSuccess("Identity issued successfully!");
      onClose();
    } catch (error) {
      showNotification(setStatus, "Error issuing identity.", "error");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{readOnly ? "View Identity" : "Add Identity"}</h2>

        {/* Account Selection */}
        <Select
          options={accountOptions}
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
          placeholder="Select Issuer Account"
          value={accountOptions.find(option => option.value === userAddress)}
          onChange={(selectedOption) => setUserAddress(selectedOption.value)}
          isDisabled={readOnly}
          className={`select-dropdown ${readOnly ? "unselectable" : ""}`}
        />

        {/* Nationality Dropdown */}
        <Select
          options={nationalityOptions}
          getOptionLabel={(e) => e.label}
          getOptionValue={(e) => e.value}
          placeholder="Select Nationality"
          value={nationalityOptions.find((option) => option.label === nationality) || null}
          onChange={(selectedOption) => setNationality(selectedOption.label)}
          isDisabled={readOnly}
          className={`select-dropdown ${readOnly ? "unselectable" : ""}`}
        />

        {/* Identity Fields */}
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
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />

        {/* Form Buttons */}
        <div className="form-buttons">
          {!readOnly && <button className="submit-btn" onClick={() => handleIssueIdentity(false)}>Submit</button>}
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
                <button className="confirm-revalidate-btn" onClick={() => handleIssueIdentity(true)}>Revalidate</button>
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
