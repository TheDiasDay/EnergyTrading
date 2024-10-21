# Energy Trading Platform

## Overview

The Energy Trading Platform is a decentralized application (dApp) that allows users to buy and sell excess renewable energy. Built on the Ethereum blockchain, this platform aims to promote renewable energy usage, increase energy efficiency, and reduce dependency on traditional power grids.

## Features

- MetaMask integration for secure authentication
- Real-time energy production and consumption tracking
- Peer-to-peer energy trading marketplace
- Transaction history and wallet balance display
- Interactive dashboard with energy overview charts

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- MetaMask browser extension
- An Ethereum wallet with some ETH for gas fees (on the network where your smart contract is deployed)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/energy-trading-platform.git
   cd energy-trading-platform
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your contract address:
   ```
   REACT_APP_CONTRACT_ADDRESS=your_contract_address_here
   ```

4. Update the `contractABI` in `src/App.js` with your smart contract's ABI.

## Running the Application

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Ensure MetaMask is connected to the correct network where your smart contract is deployed.

## Usage

1. Connect your MetaMask wallet by clicking the "Connect to MetaMask" button.
2. Once connected, you'll see the main dashboard with your energy balance, current production, and wallet balance.
3. Navigate between the Overview, Energy Market, and Transactions tabs to access different features.
4. In the Energy Market tab, you can list your excess energy for sale or purchase energy from other users.

## Smart Contract

The Energy Trading Platform interacts with a smart contract deployed on the Ethereum blockchain. Ensure you have deployed the contract and have the correct ABI and address.

## Contributing

Contributions to the Energy Trading Platform are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

![image](https://github.com/user-attachments/assets/472e29c4-0ccf-4234-ac26-48596a313770)

