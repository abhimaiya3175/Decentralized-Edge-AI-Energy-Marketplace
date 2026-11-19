# EnergyChain contracts

This Hardhat project contains the marketplace contracts. The dashboard-compatible contract is `contracts/EnergyOffer.sol`; `EnergyMarketplace.sol` and `Lock.sol` are retained as existing project contracts and tests.

## Local verification

```powershell
npm install
npx hardhat test
```

Local tests do not require Sepolia credentials. If `PRIVATE_KEY` in `.env` is incomplete, it is ignored and Sepolia is disabled so local tests can still run.

## Sepolia configuration

Set both values in `.env` only when an approved Sepolia deployment is required:

```env
SEPOLIA_RPC_URL=https://your-sepolia-rpc.example
PRIVATE_KEY=0xyour_64_hex_character_private_key
```

Deployment changes blockchain state:

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

`scripts/deploy.js` writes the deployed address to the dashboard source of truth:

```text
../energichain_backend/public/config/contract_address.json
```

The legacy copy at `energichain-contract/energichain_backend/public/config/contract-address.json` is not read by the Express frontend and must not be used to configure the dashboard.
