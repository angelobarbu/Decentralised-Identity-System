import React, { useState } from "react";
import Select from "react-select";
import countryList from "react-select-country-list";
import { issueIdentity } from "../services/identityService";
import { showNotification } from "../utils/notifications";
import RevalidatePopup from "./RevalidatePopup";

const IdentityForm = ({ contract, accounts, onClose, onSuccess, readOnly = false, identity = {} }) => {
  const [userAddress, setUserAddress] = useState(identity.userAddress || "");
  const [firstName, setFirstName] = useState(identity.firstName || "");
  const [lastName, setLastName] = useState(identity.lastName || "");
  const [dob, setDob] = useState(identity.dob || "");
  const [nationality, setNationality] = useState(identity.nationality || "");
  const [idNumber, setIdNumber] = useState(identity.idNumber || "");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [revalidatePopup, setRevalidatePopup] = useState({ show: false, message: "", formData: null, showRevalidate: false });
  

  const nationalityOptions = countryList().getData();

  let accountOptions = [];
  if (!readOnly) {
    accountOptions = accounts.map(acc => ({
      value: acc,
      label: `${acc.slice(0, 6)}...${acc.slice(-4)}`
    }));
  } else {
    accountOptions = [{ value: identity.userAddress, label: `${identity.userAddress.slice(0, 6)}...${identity.userAddress.slice(-4)}` }];
  }

  // Validation functions
  const validateForm = () => {
    let newErrors = {};

    // Ethereum Address Validation
    if (!userAddress) {
      newErrors.userAddress = "User address is required.";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      newErrors.userAddress = "Invalid Ethereum address.";
    }

    // Name Validation
    if (!firstName) {
      newErrors.firstName = "First name is required.";
    } else if (!/^[A-Za-z]+(([ '-][A-Za-z]+)*)$/.test(firstName)) {
      newErrors.firstName = "Invalid first name format.";
    }
  
    if (!lastName) {
      newErrors.lastName = "Last name is required.";
    } else if (!/^[A-Za-z]+(([ '-][A-Za-z]+)*)$/.test(lastName)) {
      newErrors.lastName = "Invalid last name format.";
    }

    // Date of Birth Validation (Must be at least 18 years old)
    if (!dob) {
      newErrors.dob = "Date of birth is required.";
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || birthDate > today) {
        newErrors.dob = "Must be at least 18 years old.";
      }
    }

    // Nationality Validation
    if (!nationality) {
      newErrors.nationality = "Nationality is required.";
    }

    // ID Number Validation (Alphanumeric, 5-20 characters)
    if (!idNumber) {
      newErrors.idNumber = "ID number is required.";
    } else if (!/^[a-zA-Z0-9]{5,20}$/.test(idNumber)) {
      newErrors.idNumber = "ID number must be 5-20 alphanumeric characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleIssueIdentity = async (revalidate = false) => {
    if (!validateForm()) return;

    try {
      const formData = { userAddress, firstName, lastName, dob, nationality, idNumber, revalidate };

      console.log("Issuing identity:", formData);
      const response = await issueIdentity(formData);
      console.log("Identity issued:", response.data);

      // Handle revalidation scenario
      if (response.data.message === "Credential exists but is revoked. Set revalidate to true to revalidate it.") {
        setRevalidatePopup({ show: true, message: `The identity ${formData.firstName} ${formData.lastName} exists but was revoked. Do you want to revalidate it?`, formData, showRevalidate: true });
        return;
      }

      if (response.data.message === "Credential already exists and is valid") {
        setRevalidatePopup({ show: true, message: `The identity ${formData.firstName} ${formData.lastName} already exists and is valid.`, formData: null, showRevalidate: false });
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
        {errors.userAddress && <p className="error-message">{errors.userAddress}</p>}

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
        {errors.nationality && <p className="error-message">{errors.nationality}</p>}

        {/* Identity Fields */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        {errors.firstName && <p className="error-message">{errors.firstName}</p>}

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        {errors.lastName && <p className="error-message">{errors.lastName}</p>}

        <input
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        {errors.dob && <p className="error-message">{errors.dob}</p>}

        <input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          readOnly={readOnly}
          className={readOnly ? "unselectable" : ""}
        />
        {errors.idNumber && <p className="error-message">{errors.idNumber}</p>}

        {/* Form Buttons */}
        <div className="form-buttons">
        {!readOnly && <button className="submit-btn" onClick={() => handleIssueIdentity(false)}>Submit</button>}
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>

        {status && <p className="status-message">{status}</p>}

        {/* Revalidation Popup */}
        <RevalidatePopup
          show={revalidatePopup.show}
          message={revalidatePopup.message}
          onClose={() => setRevalidatePopup({ show: false, message: "", formData: null, showRevalidate: false })}
          onRevalidate={revalidatePopup.showRevalidate ? () => handleIssueIdentity(true) : null}
        />
      </div>
    </div>
  );
};

export default IdentityForm;
