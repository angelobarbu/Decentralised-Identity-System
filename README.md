# Decentralised-Identity-System
## Barbu Angelo-Gabriel angelo.barbu123@gmail.com
## UNSTPB - Faculty of Automatic Control And Computer Science
## Modern Distributed Systems 2023-2024 - Advanced Software Systems Master's Degree of Engineering

This project is a Decentralized Identity Verification System using blockchain technology. It allows individuals to create, manage, and share their identity information without relying on centralized authorities, ensuring greater control and privacy.

### Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (v6.x or higher) or [yarn](https://yarnpkg.com/) (v1.22.x or higher)
- [Truffle](https://www.trufflesuite.com/truffle) (v5.x)
- [Ganache](https://www.trufflesuite.com/ganache) (v2.x)
- [MetaMask](https://metamask.io/) (Browser Extension)

### Project Structure
- `contracts/`: Contains the Solidity smart contracts.
- `migrations/`: Migration scripts to deploy the smart contracts.
- `test/`: Test scripts for the smart contracts.
- `client/`: React frontend application.

### Installing dependencies and setting up the project
- Install NPM and React app dependencies:
```
npm install
cd client
npm install
```

- Start Ganache: open Ganache and start a new workspace

- Compile and migrate smart contracts:
```
truffle compile
truffle migrate --reset
```

- Start the React application:
```
cd client
npm start
```

- Open the application: open the browser and go to [Localhost Port 3000](http://localhost:3000/)

- Connect MetaMask: Ensure MetaMask is connected to your Ganache network and import an account from Ganache to MetaMask

### Testing
- Run smart contract tests:
```
truffle test
```

- Run load test:
```
node loadTest.js
```

