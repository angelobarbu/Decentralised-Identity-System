import axios from "axios";

const API_BASE_URL = "http://localhost:5007/identity";

export const fetchIdentities = async (accounts) => {
  const queryParams = accounts.map(acc => `accounts[]=${encodeURIComponent(acc)}`).join("&");
  const response = await axios.get(`${API_BASE_URL}/get-all-identities?${queryParams}`);
  return response.data.credentials.flatMap((accountData, index) =>
    accountData.map(cred => ({ ...cred, userAddress: accounts[index] }))
  );
};

export const revokeIdentity = async (identity) => {
  await axios.post(`${API_BASE_URL}/revoke-identity`, identity);
};

export const issueIdentity = async (identityData) => {
  return await axios.post(`${API_BASE_URL}/issue-identity`, identityData);
};
