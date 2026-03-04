# campus_wallet
Campus Wallet & Payments (Algorand)

A simple Web3-based campus payment application that enables students to send and receive ALGO within their university community. The application demonstrates fundamental blockchain interactions such as wallet connection, balance retrieval, and peer-to-peer transactions.

Built on the Algorand network using Pera Wallet for secure wallet integration.

Overview

Campus Wallet & Payments is a decentralized web application designed to help students understand blockchain-based transactions. The application allows users to connect their wallet, view their balance, send ALGO to other users, view transaction history, and generate a QR code to receive payments.

The system directly interacts with the Algorand blockchain without requiring a backend server.

Features

Wallet connection using Pera Wallet

Display account balance

Send ALGO to another wallet address

View recent transaction history

Generate QR code for receiving payments

Fully decentralized frontend application

Tech Stack

Frontend

React (Vite)

Blockchain

Algorand TestNet

algosdk

Wallet Integration

Pera Wallet

Libraries

qrcode.react

System Architecture

User
↓
React Web Application
↓
Pera Wallet (Transaction Signing)
↓
Algorand Blockchain (TestNet)
↓
Indexer API (Transaction History)

The frontend creates transactions, the wallet signs them securely, and the blockchain network processes and confirms them.

System Workflow

User opens the web application.

User connects their wallet through Pera Wallet.

The application retrieves the user's wallet address and balance.

User enters the recipient wallet address and payment amount.

The frontend creates a transaction request.

Pera Wallet signs the transaction securely.

The signed transaction is submitted to the Algorand network.

The network confirms the transaction.

Updated balance and transaction history are displayed.

Project Structure
campus-wallet/
│
├── src/
│   ├── components/
│   │   ├── WalletConnect.jsx
│   │   ├── Balance.jsx
│   │   ├── SendPayment.jsx
│   │   ├── TransactionHistory.jsx
│   │   └── QRCodeDisplay.jsx
│   │
│   ├── utils/
│   │   └── algorand.js
│   │
│   └── App.jsx
│
└── package.json
Installation

Clone the repository:

git clone https://github.com/your-repo/campus-wallet.git
cd campus-wallet

Install dependencies:

npm install

Start the development server:

npm run dev
Requirements

Node.js

Pera Wallet installed on mobile device

Algorand TestNet ALGO from faucet

Future Improvements

Possible future enhancements include:

Username based payments instead of wallet addresses

Campus token ecosystem

Smart contract escrow payments

Integration with campus vendors

Event ticket payments

Web3 Alignment

This project follows key Web3 principles:

Decentralized architecture

Peer-to-peer payments

Self-custody through user wallets

Transparent blockchain ledger

License

This project is developed for educational and hackathon purposes.
