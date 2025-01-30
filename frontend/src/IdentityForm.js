import React, { useState } from "react";
import axios from "axios";

const IdentityForm = ({ contract, account, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (event) => {
    setIdDocument(event.target.files[0]);
  };

  const issueIdentity = async () => {
    try {
      const formData = new FormData();
      formData.append("userAddress", account);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("dob", dob);
      formData.append("nationality", nationality);
      formData.append("idNumber", idNumber);
      formData.append("idDocument", idDocument);

      const response = await axios.post("http://localhost:5001/issue-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(response.data.message);
    } catch (error) {
      setStatus("Error issuing identity.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Identity</h2>
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} />
        <input type="text" placeholder="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
        <input type="text" placeholder="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={issueIdentity}>Submit</button>
        <button className="close" onClick={onClose}>Close</button>
        <p>{status}</p>
      </div>
    </div>
  );
};

export default IdentityForm;
