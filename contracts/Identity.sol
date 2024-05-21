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

    function issueCredential(address user, string memory dataHash) public {
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
        for (uint i = 0; i < credentials[user].length; i++) {
            if (keccak256(abi.encodePacked(credentials[user][i].dataHash)) == keccak256(abi.encodePacked(dataHash)) && credentials[user][i].valid && credentials[user][i].issuer == msg.sender) {
                credentials[user][i].valid = false;
                emit CredentialRevoked(user, msg.sender, dataHash);
            }
        }
    }
}
