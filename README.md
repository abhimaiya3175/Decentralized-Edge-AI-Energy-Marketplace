# EnergyChain — Decentralized Edge AI Energy Marketplace

EnergyChain is a production-grade, decentralized peer-to-peer renewable energy marketplace integrating Next.js 14 App Router, Node.js/Express 5, PostgreSQL, Ethereum Sepolia smart contracts, and scikit-learn machine learning forecasting.

The single source of truth for the user interface is the Next.js frontend (`energichain_frontend/`), designed with an Obsidian & Precision dark theme. The Express backend (`energichain_backend/`) powers JWT authentication, EIP-191 cryptographic wallet binding, forward pre-booking agreements, participant messaging, and ML inference pipelines.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js Frontend (Port 3000)                         │
│   Obsidian & Precision Dark Theme • Inter + JetBrains Mono Typography  │
│                                                                        │
│  /                     Landing Hero & Protocol Metrics                 │
│  /login & /signup      Cryptographic Auth with Session Hydration       │
│  /dashboard            Overview (Live KPIs & Power Telemetry)          │
│  /dashboard/marketplace Sepolia P2P Orderbook (Buy, List, Cancel)      │
│  /dashboard/bookings   Forward Bilateral Agreements & Real-Time Chat   │
│  /dashboard/history    On-Chain Settlement Logs & Legacy Snapshot      │
│  /dashboard/solar      Physical Solar Yield (Offline ML Fallback Badge)│
│  /dashboard/wind       Simulated Wind Telemetry & Interactive Controls │
│  /dashboard/consumption Facility Load Forecasting (1,000-Row Pipeline) │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ Rewrites /backend/*            │ Web3 BrowserProvider
                    │ Rewrites /config/*             │ (Ethers.js v6)
┌───────────────────▼─────────────────────┐  ┌───────▼──────────────────┐
│        Express Backend (Port 5000)      │  │ Ethereum Sepolia Testnet │
│                                         │  │                          │
│  • JWT Auth & Normalized Credentials    │  │ EnergyOffer.sol          │
│  • Nonce-Based EIP-191 Wallet Binding   │  │ Contract Address:        │
│  • Bilateral Pre-Bookings & Messages    │  │ 0x1fD069E2a2eF49EE4FAf2  │
│  • Linear Regression Consumption ML     │  │ c5C168c92f938118DA7      │
│  • Graceful Solar 503 Fallback          │  │                          │
│  • Non-Destructive PostgreSQL Sync      │  │ • Non-Reentrant Escrow   │
└───────────────────▲─────────────────────┘  │ • Min Ticket: 0.010 ETH  │
                    │ Sequelize ORM          │ • Atomic Settlement      │
┌───────────────────▼─────────────────────┐  └──────────────────────────┘
│          PostgreSQL Database            │
│  Users • WalletBindings • Bookings      │
│  BookingMessages • Trades               │
└─────────────────────────────────────────┘
```

---

## Quick Start (Two-Command Operation)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+
- **PostgreSQL**: Running locally (default port `5432`)
- **Database**: `energichain_db`
- **MetaMask**: Browser extension (for on-chain Sepolia interactions)
- **Python 3**: For ML model training and test suites

### 2. Configure the Backend

In PowerShell / Bash:
```powershell
cd energichain_backend
npm install
```

Ensure `energichain_backend/.env` exists with your local PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energichain_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_long_random_jwt_secret_key
PORT=5000
```

Create the database once if it does not already exist:
```powershell
psql -U postgres -c "CREATE DATABASE energichain_db;"
```
*(On startup, Sequelize creates missing tables non-destructively; existing data is never wiped or force-synced).*

### 3. Run the Complete Stack

**Terminal 1 — Express Backend (Port 5000):**
```powershell
cd energichain_backend
node src/server.js
```

**Terminal 2 — Next.js Frontend (Port 3000):**
```powershell
cd energichain_frontend
npm install
npm run dev
```

| Service | URL | Notes |
| :--- | :--- | :--- |
| **EnergyChain Next.js App** | `http://localhost:3000/` | Single source of truth |
| **Dashboard** | `http://localhost:3000/dashboard` | Requires account login |
| **Express Backend API** | `http://localhost:5000/` | Locked to Port 5000 |
| **Contract Config** | `http://localhost:5000/config/contract_address.json` | Proxied via `/config/*` |
| **Legacy Snapshot** | `http://localhost:5000/config/legacy_sepolia_energyoffer_snapshot.json` | Historical archive |

---

## Core Features & Modules

### 1. Cryptographic 1:1 Wallet Binding (EIP-191 Nonce Flow)
- Upon connecting MetaMask for the first time, the client requests a single-use cryptographic challenge: `GET /auth/wallet/nonce`.
- The user signs the nonce in MetaMask (`personal_sign`).
- The backend verifies the signature using `ethers.verifyMessage`.
- The wallet is permanently bound to the PostgreSQL user (1:1 relationship).
- Replays, re-binding to a different user, or switching wallets trigger instant warnings and rejection (HTTP 409).

### 2. Peer-to-Peer On-Chain Marketplace (`/dashboard/marketplace`)
- Live interaction with `EnergyOffer.sol` (`0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7`) on Sepolia.
- **List Energy**: Producers list clean energy at `>= 0.01 ETH` with automatic seller hash generation.
- **Cancel Offer**: Restricts cancellation to the original creator.
- **Atomic Purchase**: Simulates execution via `acceptOffer.staticCall` and checks balance before broadcasting, preventing gas waste. ETH transfers atomically to the seller with non-reentrant security.

### 3. Bilateral Forward Pre-Bookings & Chat (`/dashboard/bookings`)
- Reserve future clean energy deliveries from registered providers.
- Status lifecycle: `pending` → `confirmed` (provider only) or `cancelled` (customer or provider).
- Integrated participant chat pane (`GET` & `POST /bookings/:id/messages`) with character bounds (1–2,000 characters).

### 4. Settlement History & Audit Trail (`/dashboard/history`)
- Real-time indexing of `OfferAccepted` events emitted by `EnergyOffer.sol`.
- Read-only historical snapshot viewer for legacy contracts (`0xe026E90518516bDEb48c9F585c16a3FFBf21fDaE`).

### 5. Facility Consumption ML Forecasting (`/dashboard/consumption`)
- Trained on a chronological 1,000-row facility load profile (`data/Energy_consumption.csv`).
- Predicts power demand using validated features (`temperature`, `humidity`, `squareFootage`, `occupancy`, `hvacUsage`, `lightingUsage`, `renewableEnergy`, `dayOfWeek`, `holiday`, `timestamp`).
- Out-of-distribution inputs trigger real-time pipeline warnings.

### 6. Edge Renewable Telemetry (`/dashboard/solar` & `/dashboard/wind`)
- Solar power monitoring displays physics-based estimates labeled explicitly with `Physical Estimate (ML Model Offline)`.
- Wind telemetry module features interactive wind speed sliders and turbine power calculation.

---

## Backend API Specification

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/auth/signup` | Registers new account (`name`, normalized `email`, `password` ≥ 6 chars) | No |
| `POST` | `/auth/login` | Authenticates user and returns JWT token | No |
| `GET` | `/auth/me` | Validates session; returns `{ user, walletAddress }` | Bearer JWT |
| `GET` | `/auth/wallet/nonce` | Generates 5-minute cryptographic challenge nonce for wallet binding | Bearer JWT |
| `POST` | `/auth/wallet` | Verifies EIP-191 signature and binds wallet permanently (1:1) | Bearer JWT |
| `GET` | `/trade/mine` | Retrieves historical off-chain trade records | Bearer JWT |
| `POST` | `/trade/create` | Logs settled trade record | Bearer JWT |
| `GET` | `/bookings` | Lists user's forward bookings (as customer or provider) | Bearer JWT |
| `POST` | `/bookings` | Creates new bilateral forward agreement | Bearer JWT |
| `PATCH` | `/bookings/:id/status` | Updates booking status (`confirmed` / `cancelled`) | Bearer JWT |
| `GET` | `/bookings/:id/messages` | Retrieves message thread for a booking | Bearer JWT |
| `POST` | `/bookings/:id/messages` | Sends message in booking thread (1–2,000 chars) | Bearer JWT |
| `POST` | `/api/energy-consumption/predict` | Executes Scikit-Learn ML inference on consumption parameters | No |
| `POST` | `/predict` | Solar ML endpoint (returns structured 503 `MODEL_UNAVAILABLE` when artifact is offline) | No |
| `GET` | `/config/contract_address.json` | Returns deployed contract addresses by chain ID | No |
| `GET` | `/config/legacy_sepolia_energyoffer_snapshot.json` | Returns immutable snapshot of historical offers | No |

---

## Verification & Automated Test Suites

All test suites have been verified and pass consistently:

### 1. Cryptographic Auth & Wallet Binding Test
```powershell
cd energichain_backend
npm run test:auth-wallet
```
*Validates signup normalization, password strength, 401 machine-readable token rejections, nonce issuance, signature recovery via `ethers.verifyMessage`, duplicate wallet 409 rejection, and rebind prevention.*

### 2. Bilateral Booking & Messaging Workflow Test
```powershell
cd energichain_backend
npm run test:booking
```
*Creates ephemeral test accounts, registers a forward booking, tests participant status permissions (provider confirmation, customer cancellation), and exchanges messages.*

### 3. Consumption Machine Learning Unit Tests
```powershell
cd energichain_backend
npm run test:consumption
```
*Tests Scikit-Learn pipeline feature normalization, missing field validation, range warnings, and missing artifact safety.*

### 4. Live API Smoke Test
```powershell
cd energichain_backend
npm run test:smoke
```
*Boots the Express app on port 5000 and tests contract configs, legacy snapshots, unauthenticated 401 rejection, live ML inference, and 503 fallback.*

### 5. Smart Contract Hardhat Tests
```powershell
cd energichain-contract
npx hardhat test
```
*Executes all 17 unit tests verifying minimum offer price (0.01 ETH), owner cancellation, atomic payment transfer, and settlement reentrancy protection.*

### 6. Next.js Production Build
```powershell
cd energichain_frontend
npm run build
```
*Confirms zero TypeScript, linting, or route generation errors across all 13 application routes.*

---

## Smart Contract Specification

- **Contract:** `EnergyOffer.sol`
- **Solidity Version:** `^0.8.0`
- **Sepolia Deployed Address:** `0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7`
- **Configuration:** Specified in `energichain_backend/public/config/contract_address.json` (`"11155111"`)

### Key Contract Methods:
- `createOffer(bytes32 _userHash, uint256 _price)`: Creates an active offer (requires `_price >= 0.01 ether`).
- `acceptOffer(uint256 _id) payable`: Atomically settles the offer with non-reentrant lock, transferring ETH directly to `ownerOfOffer[_id]`.
- `cancelOffer(uint256 _id)`: Deactivates an offer (callable only by the offer creator).
- `getOffer(uint256 _id)`: Returns `(bytes32 userHash, uint256 price, uint256 timestamp, bool active)`.
- `getOwnerAddress(uint256 _id)`: Returns the seller's Ethereum address.
- `getOfferCount()`: Returns the total number of offers created.

---

## Repository Structure

```text
.
├── ENERGICHAIN_COMPLETE_SYSTEM_DOCUMENTATION.md   # Exhaustive system documentation (26 sections)
├── FRONTEND_UI_SPECIFICATION.md                   # UI/UX design tokens and layout specification
├── PROJECT_AUDIT.md                               # Architectural audit and risk analysis
├── README.md                                      # This documentation
│
├── energichain_frontend/                          # Next.js 14 App Router (Single Source of Truth)
│   ├── app/
│   │   ├── components/                            # ClientProviders, AuthForm, WalletPill
│   │   ├── lib/                                   # api.js, AuthContext.jsx, WalletContext.jsx
│   │   ├── dashboard/                             # Overview, Marketplace, Bookings, History,
│   │   │                                          # Solar, Wind, Consumption
│   │   ├── login/ & signup/                       # Obsidian auth pages
│   │   ├── globals.css                            # Obsidian & Precision dark theme tokens
│   │   └── page.jsx                               # Landing page
│   ├── next.config.js                             # Backend proxy rewrites to Port 5000
│   └── package.json
│
├── energichain_backend/                           # Express 5 API Server & ML Pipeline
│   ├── src/
│   │   ├── config/db.js                           # Non-destructive Sequelize connection
│   │   ├── controllers/                           # authController, bookingController, walletController
│   │   ├── middleware/authMiddleware.js           # Standardized 401 token authentication
│   │   ├── models/                                # User, WalletBinding, Booking, BookingMessage
│   │   ├── routes/                                # authRoutes, bookingRoutes, tradeRoutes
│   │   ├── app.js                                 # Express application & route mounting
│   │   ├── server.js                              # Server entry point (Locked to Port 5000)
│   │   └── predict.py                             # Solar model wrapper (503 fallback)
│   ├── model_train/                               # Facility consumption ML model & training
│   │   ├── Energy_consumption.csv                 # 1,000-row chronological dataset
│   │   ├── train_energy_consumption.py            # Training script (80/20 train-test split)
│   │   ├── predict_energy_consumption.py          # ML inference runner
│   │   └── test_energy_consumption.py             # Model unit test suite
│   ├── scripts/                                   # Automated test harnesses
│   │   ├── verify-auth-wallet.js                  # Auth & EIP-191 binding test suite
│   │   ├── verify-booking-workflow.js             # Booking lifecycle test suite
│   │   └── verify-api-smoke.js                    # Port 5000 smoke test suite
│   ├── public/config/                             # Smart contract address & snapshot JSON
│   └── .env                                       # Local environment variables
│
└── energichain-contract/                          # Hardhat Smart Contract Suite
    ├── contracts/                                 # EnergyOffer.sol, Lock.sol
    ├── test/                                      # EnergyOffer.js unit tests (17 passing)
    ├── scripts/deploy.js                          # Sepolia deployment script
    └── hardhat.config.js                          # Hardhat network & compiler configuration
```

---

## Troubleshooting Guide

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **Port Conflict (EADDRINUSE)** | Another process running on port 3000 or 5000 | Ensure Express runs on `PORT=5000` and Next.js on `PORT=3000`. Run `Get-NetTCPConnection -LocalPort 5000` to find blocking PIDs. |
| **Database Connection Failure** | PostgreSQL is stopped or `.env` credentials incorrect | Ensure PostgreSQL service is active and `DB_PASSWORD` in `energichain_backend/.env` is correct. |
| **Wallet Mismatch Banner** | Current MetaMask account differs from the bound account | Switch MetaMask to the account originally bound to your EnergyChain user. |
| **Contract Call Reverts (4001)** | User cancelled transaction or rejected in MetaMask | Confirm transaction in MetaMask popup; ensure balance exceeds the offer price + gas. |
| **401 `TOKEN_EXPIRED`** | JWT session expired | Log in again. The frontend automatically clears stale sessions and redirects to `/login`. |
| **Solar Estimate Badge** | `solar_rf_model.pkl` artifact is absent | Expected behavior. The system displays a physics-based solar yield estimate with an explicit fallback badge. |

---

## Security Safeguards

1. **Private Keys & Secrets**: Never commit `.env` files, Ethereum private keys, or PostgreSQL passwords.
2. **Sepolia State Invariance**: The live contract address `0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7` is immutable. Never run deployment commands unless explicitly authorized.
3. **Database Integrity**: All Sequelize models run without `{ force: true }` to guarantee existing table records are preserved.
4. **Signature Verification**: Wallet bindings require an explicit EIP-191 personal signature matching a server-issued challenge nonce, preventing identity spoofing.

---

*Last Updated: November 2026 • EnergyChain Protocol Core Engineering*
