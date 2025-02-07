// SPDX-License-Identifier: CC BY-NC-ND 4.0
pragma solidity ^0.8.0;

contract Identity {
    struct Credential {
        address issuer;
        string credentialId;
        string dataHash;
        bool valid;
    }

    mapping(address => Credential[]) public credentials;

    event CredentialIssued(address indexed user, address indexed issuer, string credentialId);
    event CredentialRevoked(address indexed user, address indexed issuer, string credentialId);
    event CredentialRevalidated(address indexed user, address indexed issuer, string credentialId);


    function getCredentials(address user) public view returns (Credential[] memory) {
        if (credentials[user].length == 0) {
            return new Credential[](0);
        }
        return credentials[user];
    }


    function getValidCredentials(address user) public view returns (Credential[] memory) {
        uint validCount = 0;
        
        // Count valid credentials
        for (uint i = 0; i < credentials[user].length; i++) {
            if (credentials[user][i].valid) {
                validCount++;
            }
        }

        // Create a new array to store valid credentials
        Credential[] memory validCredentials = new Credential[](validCount);
        uint index = 0;

        // Populate the valid credentials array
        for (uint i = 0; i < credentials[user].length; i++) {
            if (credentials[user][i].valid) {
                validCredentials[index] = credentials[user][i];
                index++;
            }
        }

        return validCredentials;
    }


    function issueCredential(address user, string memory credentialId, string memory dataHash, bool revalidate) public {
        uint existingIndex = getCredentialIndex(user, credentialId);
        
        if (existingIndex != type(uint).max) {
            // Credential exists, check its validity
            if (!credentials[user][existingIndex].valid) {
                require(revalidate, "Credential exists but is revoked. Set revalidate to true to revalidate it.");
                credentials[user][existingIndex].valid = true;
                emit CredentialRevalidated(user, msg.sender, credentialId);
                return;
            } else {
                revert("Credential already exists and is valid");
            }
        }
        
        // New credential issuance
        credentials[user].push(Credential(msg.sender, credentialId, dataHash, true));
        emit CredentialIssued(user, msg.sender, credentialId);
    }


    function verifyCredential(address user, string memory credentialId) public view returns (bool) {
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].credentialId)) == keccak256(abi.encodePacked(credentialId)) && credentials[user][i].valid) {
                return true;
            }
        }
        return false;
    }


    function revokeCredential(address user, string memory credentialId) public {
        bool credentialFound = false;
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].credentialId)) == keccak256(abi.encodePacked(credentialId))) {
                credentialFound = true;
                require(credentials[user][i].issuer == msg.sender, "Only issuer can revoke");
                require(credentials[user][i].valid, "Credential is already revoked");
                credentials[user][i].valid = false;
                emit CredentialRevoked(user, msg.sender, credentialId);
                return;
            }
        }
        require(credentialFound, "Credential not found");
    }


    function getCredentialIndex(address user, string memory credentialId) internal view returns (uint) {
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].credentialId)) == keccak256(abi.encodePacked(credentialId))) {
                return i;
            }
        }
        return type(uint).max;
    }
}
