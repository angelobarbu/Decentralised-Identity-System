// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Identity {
    struct Credential {
        address issuer;
        string dataHash;
        bool valid;
    }

    mapping(address => Credential[]) public credentials;

    event CredentialIssued(address indexed user, address indexed issuer, string dataHash);
    event CredentialRevoked(address indexed user, address indexed issuer, string dataHash);
    event CredentialRevalidated(address indexed user, address indexed issuer, string dataHash);

    function getCredentials(address user) public view returns (Credential[] memory) {
        return credentials[user];
    }

    function issueCredential(address user, string memory dataHash, bool revalidate) public {
        uint existingIndex = getCredentialIndex(user, dataHash);
        
        if (existingIndex != type(uint).max) {
            // Credential exists, check its validity
            if (!credentials[user][existingIndex].valid) {
                require(revalidate, "Credential exists but is revoked. Set revalidate to true to revalidate it.");
                credentials[user][existingIndex].valid = true;
                emit CredentialRevalidated(user, msg.sender, dataHash);
                return;
            } else {
                revert("Credential already exists and is valid");
            }
        }
        
        // New credential issuance
        credentials[user].push(Credential(msg.sender, dataHash, true));
        emit CredentialIssued(user, msg.sender, dataHash);
    }

    function verifyCredential(address user, string memory dataHash) public view returns (bool) {
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].dataHash)) == keccak256(abi.encodePacked(dataHash)) && credentials[user][i].valid) {
                return true;
            }
        }
        return false;
    }

    function revokeCredential(address user, string memory dataHash) public {
        bool credentialFound = false;
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].dataHash)) == keccak256(abi.encodePacked(dataHash))) {
                credentialFound = true;
                require(credentials[user][i].issuer == msg.sender, "Only issuer can revoke");
                require(credentials[user][i].valid, "Credential is already revoked");
                credentials[user][i].valid = false;
                emit CredentialRevoked(user, msg.sender, dataHash);
                return;
            }
        }
        require(credentialFound, "Credential not found");
    }

    function getCredentialIndex(address user, string memory dataHash) internal view returns (uint) {
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].dataHash)) == keccak256(abi.encodePacked(dataHash))) {
                return i;
            }
        }
        return type(uint).max;
    }
}
