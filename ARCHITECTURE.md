# EnergyChain System Architecture

This document serves as the single architectural reference for the EnergyChain protocol and application stack, consolidating and superseding earlier audit guides.

---

## 1. System Topology & Component Overview

EnergyChain coordinates decentralized renewable energy trading through three tier layers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js 14 Frontend (Port 3000)                      │
│   Obsidian Dark Visual System • App Router • React Context             │
│                                                                        │
│  /                     Landing Hero & Protocol Metrics                 │
│  /login & /signup      Cryptographic Auth & Session Hydration          │
│  /dashboard            Overview (Live KPIs & Power Telemetry)          │
│  /dashboard/marketplace Sepolia P2P Orderbook (Escrow ABI Compatible)   │
│  /dashboard/bookings   Forward Bilateral Agreements & WebSocket Chat   │
│  /dashboard/history    On-Chain Settlement Logs & Legacy Snapshot      │
│  /dashboard/solar      Physical Solar Yield (Offline ML Fallback Badge)│
│  /dashboard/wind       Simulated Wind Telemetry & Turbine Controls     │
│  /dashboard/consumption Facility Load Forecasting (Subprocess Pipeline)│
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │ Rewrites /backend/*            │ Web3 BrowserProvider
                    │ Rewrites /config/*             │ (Ethers.js v6)
┌───────────────────▼─────────────────────┐  ┌───────▼──────────────────┐
│      Express 5 Backend (Port 5000)      │  │ Ethereum Network         │
│                                         │  │                          │
│  • JWT Auth & Normalized Credentials    │  │ EnergyOffer.sol          │
│  • Nonce-Based EIP-191 Wallet Binding   │  │                          │
│  • Bilateral Pre-Bookings & Messages    │  │ Active Sepolia Contract: │
│  • WebSocket Bilateral Coordination Chat│  │ 0x1fD069E2a2eF49EE4FAf2  │
│  • Centralized Subprocess ML Pipeline   │  │ c5C168c92f938118DA7      │
│  • Non-Destructive PostgreSQL Sync      │  │                          │
│  • Hardened Helmet CSP & Proxy Rate Lim │  │ Local Hardhat:           │
└───────────────────▲─────────────────────┘  │ 5-State Escrow Machine   │
                    │ Sequelize ORM          │ 19 Passing Unit Tests    │
┌───────────────────▼─────────────────────┐  └──────────────────────────┘
│          PostgreSQL Database            │
│  Users • WalletBindings • Bookings      │
│  BookingMessages • Trades               │
└─────────────────────────────────────────┘
```

---

## 2. Smart Contract Architecture & Escrow State Machine

### 2.1 Contract Redesign (`EnergyOffer.sol`)
In the review-fixes redesign, the escrow contract was rewritten as an explicit finite state machine with five distinct states:
1. **`Open`**: Producer lists renewable energy specifying `energyKwh`, `priceWei`, and a unix `deliveryWindow`. The seller address is derived strictly from `msg.sender` (caller cannot supply an arbitrary or unverified hash).
2. **`Locked`**: Buyer calls `acceptOffer{value: priceWei}(offerId)`. Exact payment is locked into contract custody (the contract holds the ether; seller cannot withdraw).
3. **`Delivered`**: Buyer calls `confirmDelivery(offerId)`, releasing the locked payment to the seller. If the delivery window and an automatic 24-hour grace period expire without buyer dispute, the seller can call `claimTimeoutPayment(offerId)` to claim funds.
4. **`Refunded`**: If the seller fails to mark delivery fulfilled before the delivery window lapses, the buyer calls `claimRefund(offerId)` to receive a full refund from escrow.
5. **`Cancelled`**: Seller can cancel an unaccepted offer while it remains in `Open` state.

### 2.2 Reentrancy Protection
All funds-transfer functions (`confirmDelivery`, `claimTimeoutPayment`, `claimRefund`) utilize OpenZeppelin's `ReentrancyGuard` with checks-effects-interactions ordering, verified against malicious callback contracts (`ReentrantSeller.sol`).

### 2.3 Contract Addresses Reconciliation
- **Sepolia Active Legacy Contract**: `0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7`
  - Specified in `energichain_backend/public/config/contract_address.json` (`"11155111"`).
  - This is the previously deployed Sepolia contract used for testnet interactions.
- **Sepolia Historical Testnet Snapshot Contract**: `0xe026E90518516bDEb48c9F585c16a3FFBf21fDaE`
  - Specified in `energichain_backend/public/config/contract_history.json`.
  - Immutable testnet trades are archived in `legacy_sepolia_energyoffer_snapshot.json` and viewable under `/dashboard/history`.
- **Sepolia Deployment Status**: **No new contract was deployed to Sepolia during review fixes**.
  - All review-fixes contract verification was conducted exclusively on local Hardhat (`energichain-contract/test/EnergyOffer.js`, 19 passing tests).
  - Live Sepolia deployment remains gated behind the `CONFIRM_SEPOLIA_DEPLOYMENT` environment flag and explicit human approval.

---

## 3. Backend & Security Architecture

### 3.1 Authentication & User Enumeration Mitigations
- Passwords are validated during registration against a strict policy (minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 special symbol). Existing users with legacy credentials can continue logging in.
- **User Enumeration**: Login incorporates constant-time dummy bcrypt comparison when an email is not found, equalizing execution timing (~65–68ms) with invalid password attempts. However, user enumeration is **mitigated, not eliminated**: registration endpoints necessarily reject duplicate emails with HTTP 409 `USER_ALREADY_EXISTS`.

### 3.2 Cryptographic Wallet Binding (EIP-191)
- Nonce-based challenge: `/auth/wallet/nonce` generates a 5-minute single-use cryptographic token.
- EIP-191 Personal Sign: MetaMask signs the nonce via `personal_sign`.
- Verification: The backend recovers the signer address using `ethers.verifyMessage` and binds it permanently (1:1) to the PostgreSQL `User` account. Re-binding or sharing wallets across multiple accounts is rejected.

### 3.3 Reverse Proxy & Rate Limiting
- Express is configured with `app.set("trust proxy", 1)`.
- Rate limiting isolates client IP buckets using the leftmost forwarded address from `X-Forwarded-For`, preventing shared proxy IP exhaustion.
- Rate limits are disabled or relaxed during automated testing (`NODE_ENV=test`) and strictly enforced in production.

### 3.4 Content Security Policy (CSP) & CORS
- Helmet is configured with explicit Content-Security-Policy directives.
- Self-hosted vendor bundles (`/vendor/chart.js`, `/vendor/ethers`) eliminate external CDN runtime risks, and `'unsafe-eval'` is strictly omitted.
- Non-browser HTTP clients (curl, automated test runners, server-to-server calls) omitting the `Origin` header are permitted; browser origins are validated against a strict allowlist.

---

## 4. Machine Learning & Forecasting Architecture

### 4.1 Centralized Server-Side Execution (Not Edge AI)
Machine learning models are executed centrally as server-side Python subprocesses managed via `python-shell` with child PID process-group tracking:
- **Timeout Protection**: Inferences taking longer than 15 seconds are aborted, and child processes are killed cleanly via `SIGTERM` / `SIGKILL`.
- **Concurrency Semaphore**: A concurrency counter limits active inferences to a maximum of 5 concurrent runs, returning HTTP 503 `INFERENCE_BUSY` under heavy load to prevent CPU starvation.

### 4.2 Facility Load Forecasting (Consumption Model)
- Supervised Gradient Boosting regressor with systematic hyperparameter tuning trained on 1,000 chronological observations (`data/Energy_consumption.csv`).
- Selected algorithm: `GradientBoostingRegressor` with optimal hyperparameters (`n_estimators: 150`, `learning_rate: 0.05`, `max_depth: 3`, `subsample: 0.75`, `min_samples_leaf: 4`), achieving lower validation error (RMSE 4.8386 vs 5.0018 for linear baseline) and higher variance explained (R² 0.6180 vs 0.5917).
- Predicts facility energy consumption based on temperature, humidity, square footage, occupancy, HVAC usage, and lighting.
- Out-of-bounds input features trigger telemetry warnings without corrupting inferences.

### 4.3 Solar Power Yield Forecasting & Reproducibility
- Reproducible training pipeline: `model_train/train_solar_reproducible.py`.
- **Zero Data Fabrication**: If the real public Kaggle "Solar Power Generation Data" CSV files are missing, the script halts immediately with exit code 1 and displays download instructions. Synthetic or fake data generation is strictly prohibited.
- **Graceful Fallback**: When model artifacts are offline, the API returns a structured HTTP 503 `MODEL_UNAVAILABLE`, prompting the frontend to display a physics-based estimate with a clear fallback badge.

---

## 5. Frontend & UI Consolidation

### 5.1 Single Source of Truth
The primary frontend is the Next.js 14 App Router application (`energichain_frontend/`), utilizing an Obsidian dark visual theme inspired by MetaMask:
- Obsidian (`#0F1015`) base backgrounds with slate card overlays.
- Real-time bilateral pre-booking coordination and WhatsApp-style WebSocket chat.
- Unified wallet status pills with chain detection and automatic account binding synchronization.

### 5.2 Legacy UI Preservation
In compliance with project requirements, legacy user interfaces have been moved without deletion into `legacy/`:
- `legacy/public/`: Legacy static HTML dashboards and Vite build artifacts.
- `legacy/client/`: Legacy React SPA source files.
- Express serves `/legacy/dashboard` directly from `legacy/public/dashboard.html` for backward compatibility.
