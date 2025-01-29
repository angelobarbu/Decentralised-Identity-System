import React, { useState, useEffect } from "react";
import axios from "axios";
import getBlockchain from "./Blockchain";
import "./App.css";

const App = () => {
  const [accounts, setAccounts] = useState([]);
  const [identityContract, setIdentityContract] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState(null);
  const [status, setStatus] = useState("");
  const [identities, setIdentities] = useState([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { contract, accounts } = await getBlockchain();
        setAccounts(accounts);
        setIdentityContract(contract);
        loadIdentities(accounts[0]);
      } catch (error) {
        setStatus("Error loading blockchain.");
      }
    };
    init();
  }, []);

  const handleFileChange = (event) => {
    setIdDocument(event.target.files[0]);
  };

  const issueIdentity = async () => {
    try {
      const formData = new FormData();
      formData.append("userAddress", accounts[0]);
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
      loadIdentities(accounts[0]);
    } catch (error) {
      setStatus("Error issuing identity.");
    }
  };

  const loadIdentities = async (userAddress) => {
    try {
      const response = await axios.get(`http://localhost:5001/get-identities/${userAddress}`);
      setIdentities(response.data.credentials);
    } catch (error) {
      console.error("Error loading identities:", error);
    }
  };

  return (
    <div className="container">
      <h1>Decentralized Identity Verification</h1>
      <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <input type="date" placeholder="Date of Birth" value={dob} onChange={(e) => setDob(e.target.value)} />
      <input type="text" placeholder="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
      <input type="text" placeholder="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={issueIdentity}>Issue Identity</button>

      <h2>Your Identities</h2>
      {identities.map((id, index) => (
        <p key={index}>{id.dataHash}</p>
      ))}
      <p>{status}</p>
    </div>
  );
};

export default App;
