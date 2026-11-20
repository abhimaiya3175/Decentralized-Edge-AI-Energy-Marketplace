# EnergyChain — Decentralized Energy Marketplace with Centralized ML Forecasting

EnergyChain is a decentralized peer-to-peer renewable energy marketplace integrating a Next.js 14 App Router frontend, Node.js/Express 5 API server, PostgreSQL database, Ethereum smart contracts, and centralized scikit-learn machine learning forecasting.

> **Architecture Documentation**: For exhaustive technical details, security designs, and component interactions, see [ARCHITECTURE.md](file:///e:/ProJect/Decentralized-Edge-AI-Energy-Marketplace-main/Decentralized-Edge-AI-Energy-Marketplace-main/ARCHITECTURE.md). Historical audit records and earlier documentation versions are archived in [docs/archive/](file:///e:/ProJect/Decentralized-Edge-AI-Energy-Marketplace-main/Decentralized-Edge-AI-Energy-Marketplace-main/docs/archive/).

---

## Key Review Fixes & Architectural Principles

1. **Centralized ML Forecasting (Not Edge AI)**: Machine learning models run as managed server-side Python subprocesses on the backend with timeout protection (15s) and concurrency limiting (max 5 simultaneous processes).
2. **Escrow State Machine**: Smart contract trading implements a 5-state machine (`Open`, `Locked`, `Delivered`, `Refunded`, `Cancelled`) with caller validation (`msg.sender` derived) and non-reentrant escrow fund locking.
3. **Contract Deployment Status & Reconciliation**:
   - **Sepolia Active Legacy Contract**: `0x1fD069E2a2eF49EE4FAf2c5C168c92f938118DA7` (configured in `energichain_backend/public/config/contract_address.json`).
   - **Sepolia Historical Testnet Snapshot Contract**: `0xe026E90518516bDEb48c9F585c16a3FFBf21fDaE` (archived in `contract_history.json` and `legacy_sepolia_energyoffer_snapshot.json`).
   - **No New Sepolia Deployments**: No new contracts were deployed to Sepolia during review fixes. All smart contract verification was executed locally on Hardhat (19 unit tests passing). Live deployment remains guarded behind `CONFIRM_SEPOLIA_DEPLOYMENT`.
4. **Security Hardening**:
   - Rate limiting with reverse proxy trust (`trust proxy: 1`) and forwarded client IP isolation (`X-Forwarded-For`).
   - Strict Content Security Policy with self-hosted vendor bundles (`/vendor/chart.js`, `/vendor/ethers`) and zero `'unsafe-eval'`.
   - Dummy bcrypt hashing equalizes login response times (~65–68ms), though user enumeration is **mitigated, not eliminated** (registration necessarily reports duplicate emails).
5. **Reproducible Solar Model Training**:
   - `model_train/train_solar_reproducible.py` strictly prevents fake data fabrication. When Kaggle datasets are absent, it halts with clear download instructions rather than inventing mock inputs.
6. **Frontend Consolidation**:
   - Single source of truth is the Next.js 14 frontend (`energichain_frontend/`).
   - Older static HTML and Vite React source files are preserved under `legacy/public/` and `legacy/client/`. Express serves `/legacy/dashboard` for backward compatibility.

---

## Quick Start (Two-Command Operation)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x+ (tested on v22.14.0)
- **PostgreSQL**: Running locally (default port `5432`)
- **Database**: `energichain_db` (for local development; tests run against dedicated `*_test` DBs)
- **MetaMask**: Browser extension for on-chain interactions
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
| **Legacy HTML Dashboard** | `http://localhost:5000/legacy/dashboard` | Backward compatibility |

---

## Verification & Automated Test Suites

All test suites pass consistently across smart contracts, backend, ML models, security safeguards, and frontend builds:

### 1. Smart Contract Hardhat Tests (Escrow State Machine)
```powershell
cd energichain-contract
npx hardhat test
```
*Executes all 19 unit tests verifying 5-state escrow lifecycle (`Open`, `Locked`, `Delivered`, `Refunded`, `Cancelled`), derived seller identity, buyer fund locking, release on confirmation, timeout claims, refund claims, and settlement reentrancy protection.*

### 2. Cryptographic Auth & Wallet Binding Test
```powershell
cd energichain_backend
$env:DB_NAME="energichain_test"
npm run test:auth-wallet
```
*Validates signup normalization, password strength, 401 machine-readable token rejections, nonce issuance, signature recovery via `ethers.verifyMessage`, duplicate wallet 409 rejection, and rebind prevention.*

### 3. Bilateral Booking & Messaging Workflow Test
```powershell
cd energichain_backend
$env:DB_NAME="energichain_test"
npm run test:booking
```
*Creates ephemeral test accounts, registers a forward booking, tests participant status permissions (provider confirmation, customer cancellation), and exchanges messages.*

### 4. Live API Smoke Test
```powershell
cd energichain_backend
$env:DB_NAME="energichain_test"
npm run test:smoke
```
*Boots the Express app on port 5000 and tests contract configs, legacy snapshots, unauthenticated 401 rejection on ML endpoints, live ML inference, and 503 fallback.*

### 5. Consumption Machine Learning Unit Tests
```powershell
cd energichain_backend
npm run test:consumption
```
*Tests Scikit-Learn pipeline feature normalization, missing field validation, range warnings, and missing artifact safety.*

### 6. Security Hardening Suite
```powershell
cd energichain_backend
$env:DB_NAME="energichain_test"
npm run test:security
```
*Verifies Helmet CSP headers, CORS origin filtering, password policy enforcement, legacy user login, dummy bcrypt timing, proxy rate limit bucket isolation, Python timeout PID cleanup, and concurrency semaphores.*

### 7. Reproducible Solar Training Pipeline Test
```powershell
cd energichain_backend
npm run train:solar
```
*Verifies that the reproducible solar training pipeline enforces zero data fabrication, terminating cleanly with download instructions when Kaggle datasets are missing.*

### 8. Next.js Production Build
```powershell
cd energichain_frontend
npm run build
```
*Confirms zero TypeScript, linting, or route generation errors across all 13 application routes.*

---

## Repository Structure

```text
.
├── ARCHITECTURE.md                                # Master architectural reference
├── README.md                                      # Project overview and quick start guide
├── docs/archive/                                  # Archived historical documentation
│   ├── ENERGICHAIN_COMPLETE_SYSTEM_DOCUMENTATION.md
│   ├── FRONTEND_UI_DOCUMENTATION.md
│   ├── FRONTEND_UI_SPECIFICATION.md
│   ├── PROFESSIONAL_FRONTEND_UI_GUIDE.md
│   └── PROJECT_AUDIT.md
│
├── legacy/                                        # Preserved legacy frontend artifacts
│   ├── public/                                    # Legacy HTML dashboards & static assets
│   │   ├── dashboard.html                         # Served via /legacy/dashboard
│   │   ├── index.html, login.html, signup.html
│   │   └── app/                                   # Legacy Vite React build output
│   └── client/                                    # Legacy Vite React source code
│
├── energichain_frontend/                          # Next.js 14 App Router (Primary Frontend)
│   ├── app/
│   │   ├── components/                            # ClientProviders, AuthForm, WalletPill
│   │   ├── lib/                                   # api.js, AuthContext.jsx, WalletContext.jsx
│   │   ├── dashboard/                             # Overview, Marketplace, Bookings, History,
│   │   │                                          # Solar, Wind, Consumption
│   │   ├── login/ & signup/                       # Auth pages
│   │   ├── globals.css                            # Obsidian dark theme design tokens
│   │   └── page.jsx                               # Landing page
│   ├── next.config.js                             # Security headers & backend proxy rewrites
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
│   ├── model_train/                               # ML model training & inference
│   │   ├── Energy_consumption.csv                 # Chronological facility dataset
│   │   ├── train_energy_consumption.py            # Facility load training
│   │   ├── train_solar_reproducible.py            # Reproducible solar pipeline (zero fake data)
│   │   ├── SOLAR_TRAINING_GUIDE.md                # Kaggle download & training guide
│   │   ├── predict_energy_consumption.py          # ML inference runner
│   │   └── test_energy_consumption.py             # Model unit test suite
│   ├── scripts/                                   # Automated test harnesses
│   │   ├── verify-auth-wallet.js                  # Auth & EIP-191 binding test suite
│   │   ├── verify-booking-workflow.js             # Booking lifecycle test suite
│   │   ├── verify-api-smoke.js                    # Port 5000 smoke test suite
│   │   └── verify-security-hardening.js           # Security hardening verification
│   ├── public/config/                             # Smart contract address & snapshot JSON
│   └── .env                                       # Local environment variables
│
└── energichain-contract/                          # Hardhat Smart Contract Suite
    ├── contracts/                                 # EnergyOffer.sol, Lock.sol
    ├── test/                                      # EnergyOffer.js unit tests (19 passing)
    ├── scripts/deploy.js                          # Deployment script (Sepolia guard enabled)
    └── hardhat.config.js                          # Hardhat configuration
```

---

*Last Updated: November 2026 • EnergyChain Protocol Core Engineering*
