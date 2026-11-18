# EnergyChain — Decentralized Edge AI Energy Marketplace

EnergyChain is a local renewable-energy marketplace with a browser dashboard, JWT authentication, PostgreSQL-backed pre-bookings and booking messages, and Sepolia-compatible energy-offer contracts.

The browser frontend is served by the Express backend. There is no separate frontend development server.

## Quick start

### 1. Prerequisites

- Node.js 18 or later
- PostgreSQL running locally
- A PostgreSQL database named `energichain_db`
- MetaMask only if you want to use on-chain offer actions

Optional: Python 3 for model-training work, and Sepolia test ETH only for explicitly approved blockchain transactions.

### 2. Configure the backend

Open PowerShell in the repository root and install the backend packages:

```powershell
cd energichain_backend
npm install
```

Create `energichain_backend/.env` if it does not already exist. Keep real credentials private; do not commit this file.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energichain_db
DB_USER=postgres
DB_PASSWORD=replace_with_your_postgres_password
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

Create the database once, if it does not exist:

```powershell
psql -U postgres -c "CREATE DATABASE energichain_db;"
```

If PostgreSQL reports that the database already exists, continue without recreating it. On startup, the backend creates only missing tables; it does not force-sync or alter existing data.

### 3. Run the application

```powershell
cd energichain_backend
node src/server.js
```

When the terminal displays `EnergyChain backend running on PORT 5000`, open:

```text
http://localhost:5000
```

| Page | URL |
| --- | --- |
| Landing page | `http://localhost:5000/` |
| Sign up | `http://localhost:5000/signup.html` |
| Log in | `http://localhost:5000/login.html` |
| Dashboard | `http://localhost:5000/dashboard.html` |

To stop the server, press `Ctrl+C` in the terminal that is running it.

## Normal user workflow

1. Open the sign-up page and create an account.
2. Log in. The frontend stores the JWT session in browser session storage.
3. Open the dashboard.
4. Use **Pre-booking** to reserve future energy from a registered provider.
5. The provider can confirm a pending booking; either participant can cancel a pending booking.
6. Open **Messages** for a booking to exchange messages with the other participant.
7. Connect MetaMask only when using Marketplace contract actions.

The dashboard labels local solar estimates and simulated wind/battery values clearly. They are not live telemetry or a trained ML prediction service.

## Backend API

| Method | Route | Purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/auth/signup` | Create account and return JWT | No |
| `POST` | `/auth/login` | Authenticate and return JWT | No |
| `GET` | `/trades` | List trade records | See route behavior |
| `POST` | `/trades` | Create a trade record | JWT |
| `GET` | `/bookings/mine` | Current user's bookings | JWT |
| `POST` | `/bookings` | Create pre-booking | JWT |
| `PATCH` | `/bookings/:id/status` | Confirm or cancel booking | JWT and participant |
| `GET` | `/bookings/:id/messages` | Read booking conversation | JWT and participant |
| `POST` | `/bookings/:id/messages` | Send booking message | JWT and participant |

Use:

```text
Authorization: Bearer <token>
```

## Verification

Start the backend first, then run the database booking workflow test:

```powershell
cd energichain_backend
npm run test:booking
```

The test creates temporary users, a booking, and a message, then removes that test data when it finishes. A successful run prints:

```text
BOOKING_WORKFLOW=PASS
BOOKING_WORKFLOW_TEST_DATA=REMOVED
```

## Smart contracts

Contracts are in `energichain-contract/contracts/`. The dashboard uses the address in:

```text
energichain_backend/public/config/contract_address.json
```

### Install dependencies and run local tests

```powershell
cd energichain-contract
npm install
npx hardhat test
```

For local tests, omit `PRIVATE_KEY` and `SEPOLIA_RPC_URL` from `energichain-contract/.env`, or provide a valid private key (64 hexadecimal characters, optionally prefixed with `0x`). An incomplete private key causes Hardhat configuration validation to fail before tests run.

### Sepolia deployment

Deployment changes blockchain state and is intentionally not part of normal startup. Only run it after explicit approval and after setting valid credentials in `energichain-contract/.env`:

```env
SEPOLIA_RPC_URL=https://your-sepolia-rpc.example
PRIVATE_KEY=0xyour_64_hex_character_private_key
```

```powershell
cd energichain-contract
npx hardhat run scripts/deploy.js --network sepolia
```

The script updates `energichain_backend/public/config/contract_address.json`. Never paste a private key into source code, chat, or screenshots.

## ML training files

Current model-training scripts are in `energichain_backend/model_train/`. They do not start automatically with the Express application. The Solar Power tab deliberately uses a local estimate until a trained model and compatible backend endpoint are integrated.

## Project layout

```text
.
├── energichain_backend/
│   ├── public/                 # Landing, login, signup, dashboard, Chart.js asset
│   ├── src/                    # Express app, models, routes, controllers
│   ├── scripts/                # Booking workflow verification
│   ├── model_train/            # Python model-training scripts
│   └── .env                    # Local secrets; not committed
├── energichain-contract/
│   ├── contracts/              # Solidity contracts
│   ├── scripts/deploy.js       # Optional Sepolia deployment
│   ├── test/                   # Hardhat tests
│   └── .env                    # Optional Sepolia secrets; not committed
├── FRONTEND_UI_DOCUMENTATION.md
└── PROFESSIONAL_FRONTEND_UI_GUIDE.md
```

## Troubleshooting

| Problem | Check |
| --- | --- |
| Backend will not start | Confirm PostgreSQL is running and each backend `.env` database value is correct. |
| `ECONNREFUSED` or blank page | Start `node src/server.js` from `energichain_backend`, then open port 5000. |
| Booking access denied | Log in through the backend-backed account flow so the browser has a valid JWT. |
| MetaMask does not connect | Unlock MetaMask and approve the dashboard's switch to Sepolia Testnet. |
| Hardhat says private key is too short | Correct or remove `PRIVATE_KEY` in `energichain-contract/.env` before local tests. |
| Charts do not render | Confirm `http://localhost:5000/vendor/chart.js/chart.umd.js` returns HTTP 200. |

## Security notes

- Do not commit `.env` files, wallet keys, JWT secrets, or database passwords.
- Do not run Sepolia deployment commands unless blockchain state changes are approved.
- Use a dedicated test wallet for Sepolia, never a wallet that holds valuable funds.

---

Last updated: November 18, 2026
