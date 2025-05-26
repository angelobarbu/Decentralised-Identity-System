# Decentralised-Identity-System
### © Angelo-Gabriel Barbu - angelo.barbu123@gmail.com - 2025

## Table of Contents

- [Decentralised-Identity-System](#decentralised-identity-system)
    - [© Angelo-Gabriel Barbu - angelo.barbu123@gmail.com - 2025](#-angelo-gabriel-barbu---angelobarbu123gmailcom---2025)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [High-Level Software Architecture](#high-level-software-architecture)
  - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Project Components](#project-components)
    - [Ganache](#ganache)
      - [Usage Instructions](#usage-instructions)
    - [Smart Contracts](#smart-contracts)
      - [Contract Structure](#contract-structure)
      - [Setting up](#setting-up)
      - [Testing](#testing)
    - [Business Logic](#business-logic)
      - [Setting up](#setting-up-1)
  - [**NOTE:** Change `DEPLOYED_CONTRACT_ADDRESS` each time you reset Ganache.](#note-change-deployed_contract_address-each-time-you-reset-ganache)
    - [Visual Components](#visual-components)
      - [Setting up](#setting-up-2)
  - [How to Install](#how-to-install)
  - [Development Plan](#development-plan)
      - [High](#high)
      - [Medium](#medium)
      - [Low](#low)

<br>

## Introduction

The project focuses on designing, implementing and testing a complete solution that incorporates a Decentralized Identity Verification System based on blockchain technology, having the purpose of providing a platform where individuals can issue, manage and revoke identity credentials, that can be used for identity confirmation. That way, we want to achieve a high level of control and privacy over sensitive personal information, by implementing an `Identity Digital Wallet`, while offering an efficient method to verify an individual's indetity by third-party entities through a `Verification Interface`.
<br>

The system is based on <b>Ethereum blockchain</b> and deployed on <b>Ethereum Virtual Machine (EVM)</b>, as a viable choice, considering its major adoption, high degrees of stability and security and a well defined development and testing framework.

<br>

## High-Level Software Architecture
![](/resources/High_level_Disertatie_EN.png "High-Level Software Architecture")

<br>

## Prerequisites
- [Node.js](https://nodejs.org/) - Business Logic (Frontend)
- [React.js](https://react.dev) - Visual Components (Backend)
- [npm](https://www.npmjs.com/) - Node Package Manager
- [Web3.js](https://web3js.readthedocs.io/en/v1.10.0/) - JavaScript Libraries for Ethereum Node Interactions
- [Truffle](https://www.trufflesuite.com/truffle) - Development Environment for Ethereum Virtual Machine (EVM)
- [Ganache](https://www.trufflesuite.com/ganache) - Local 
Ethereum blockchain environment 
- [Solidity](https://soliditylang.org) - Smart Contracts Programming Language
- [MetaMask](https://metamask.io/) - Browser Extension for Digital Wallets

<br>

## Project Structure
- `backend/`: Contains the Backend level of the project where Business Logic, Data Processing and Frontend <-> Smart Contracts communication is implemented, using <b>Node.js</b>.

- `frontend/`: Visual Components (Frontend level) for Identity Digital Wallet management and MetaMask connection, developed with <b>React.js</b>.

- `ganache/`: Bash scripts implemented to start and configure Ganache network using <b>Ganache CLI</b>.

- `smart_contracts/`: Smart Contracts module where implementation (<b>Solidity</b>), testing, compilation and migration instructions are developed, based on <b>Truffle</b> development environment and project structure.

<br>

## Project Components

### Ganache
The `Ganache` module is responsible for setting up and managing the Ethereum blockchain locally hosted using <b>Ganache CLI</b>.

#### Usage Instructions
1. Set up local blockchain: This will generate a <i>mnemonic</i> and a dummy database for contract deployments, transactions and test wallets.
```bash
./config-ganache.sh setup
```

<b>NOTE:</b> Reset environment database, including deployed contract, public-private wallet keypairs and past transactions.
```bash
./config-ganache.sh reset
```

2. Start Ethereum blockchain
```bash
./start-ganache.sh
```

- Ganache network runs at: `http://127.0.0.1:8545`.
- Config scripts uses a collection of words defined in an environment file to return the <i>mnemonic</i>. Consider adding an `.env` file with the following structure:
```
# Define the words to be used for generating mnemonics
MNEMONIC_WORDS="apple banana cherry date eagle falcon grape honey ice jelly kite lemon mango nut olive pear queen rose star tiger umbrella violet whale xray yellow zebra"
```

---

<br>

### Smart Contracts
The `Smart Contracts` module contains the implementation of the Smart Contract for the system. It provided the methods responsible for issuing, verifying, revoking and retrieving identity credentials on the blockchain.

#### Contract Structure
![](/resources/Identity_Contract_EN.png "Identity Smart Contract Structure")

#### Setting up
Install dependencies
```bash
npm install
```

Compile and migrate smart contracts:
```bash
truffle compile
truffle migrate --reset
```
After compilation, the contract ABI generated at `build/contracts/Identity.json` is migrated to the `frontend` and `backend` module. The migration strategy can be found at `migrations/2_deploy_contracts.js`.

#### Testing
Integration and unit tests are implemented in `test/Identity.test.js` to check the functionality, the performance and the security of the smart contract and its methods. They can be executed using:
```
truffle test
```
The generated file `test/test-results.json` contains the performance data for the executed load test. 

---

<br>

### Business Logic
The `Backend` module is a <b>Node.js</b> server that follows the <b>Model-View-Controller (MVC)</b> pattern, organizing the business logic into structured components. It interacts with the Ethereum blockchain using Web3.js and connects with the `frontend` to process identity-related requests.

#### Setting up
1. Install NPM dependencies
```bash
npm install
```

2. Run backend server
```bash
npm run start
```

<b>NOTE:</b> For running with <i>nodemon</i> for development purposes:
```bash
npm run dev
```

3. Set up an `.env` file with the following structure as example:
```bash
PORT=5001
GANACHE_RPC_URL=http://127.0.0.1:8545
DEPLOYED_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
OCR_API_KEY=<OCR_API_KEY>
SECRET_KEY=<SECRET_KEY>
```
**NOTE:** Change `DEPLOYED_CONTRACT_ADDRESS` each time you reset Ganache.
---

<br>

### Visual Components
The `Frontend` module is a <b>React.js</b> application that provides a user-friendly interface for interacting with the system. It enables users to connect their MetaMask wallet, issue credentials, revoke credentials, and view their identity credentials.

#### Setting up
1. Install NPM dependencies
```bash
npm install
```

2. Start React.js application
```bash
npm start
```
<b>NOTE:</b> After setting up and running all project components, the application should be functional and accesible at `http://localhost:3000`.

<br>

## How to Install
1. Set up Ganache environment
```bash
cd ganache # Considering project root directory
./config-ganache.sh setup
```

2. Start Ganache CLI
```bash
./start-ganache.sh
```

3. Compile and migrate Smart Contract
```bash
cd smart_contracts # Considering project root directory
truffle compile
truffle migrate --reset
```

4. Check if Smart Contract was compiled and deployed successfully
```bash
truffle test
```

5. Install backend dependencies and start Node.js server
```bash
cd backend # Considering project root directory
npm install
npm run start
```

6. Install frontend dependencies and start React.js application
```bash
cd frontend # Considering project root directory
npm install
npm start
```

- The application should be functional and accesible [here](http://localhost:3000) (at `http://localhost:3000`).

<br>

## Development Plan

There is a plan for further development, depending on the priority. At the current state of the system overall, the priority stands as follows:

#### High
1. Redefinition of Issue Credential Form(proper field validation, adding more relevant fields, identity document processing);

#### Medium
1. Develop Verification Interface for third-party validation requests;
2. Implement authentication module that tests Verification Interface;
3. In-depth unit testing for all the components, with a high coverage degree;
4. Further performance improvements overall;
5. Implementing personal secret key for credential access.

#### Low
1. Implementing handling multiple wallet platforms.
2. Identity type separation based on age ( < 18 ).