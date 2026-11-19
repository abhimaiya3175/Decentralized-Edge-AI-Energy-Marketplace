# EnergyChain Project Audit

Audit date: November 18, 2026

## Scope and method

This inventory was produced from the current repository source, not only from prior documentation. It covers the static frontend, Express backend, Sequelize models, booking workflow, Solidity contracts, compiled artifacts, deployment configuration, and Python model files. Secrets were not read or recorded.

## Implementation inventory

| Area | Status | Verified implementation |
| --- | --- | --- |
| Landing, login, sign-up, dashboard | WORKING | Four static pages are served from `energichain_backend/public/` by Express. |
| Dashboard tabs | WORKING | Overview, Solar Power, Wind Energy, Marketplace, Pre-booking, and History retain their IDs, handlers, and tab behavior. |
| Chart.js | FIXED AND VERIFIED | Pinned Chart.js 4.4.3 is served locally at `/vendor/chart.js/chart.umd.js`. |
| JWT authentication | WORKING | `/auth/signup` and `/auth/login` create JWT-backed sessions; the booking workflow test receives JWTs from sign-up. |
| Pre-booking and messages | FIXED AND VERIFIED | JWT participant authorization, customer/provider status rules, message persistence, and cleanup were verified by `npm run test:booking`. |
| PostgreSQL initialization | WORKING | `sequelize.authenticate()` plus non-destructive `sequelize.sync()` creates only missing tables; no `force` or `alter` synchronization is used. |
| Trade API | PARTIALLY WORKING | `/trade/create` and `/trade/mine` exist with JWT middleware, but the dashboard marketplace uses Ethers/MetaMask directly rather than these routes. |
| MetaMask and Sepolia handling | REQUIRES EXTERNAL CONFIGURATION | Dashboard detects MetaMask, requests Sepolia, reacts to account/network changes, reads the configured address, and now checks deployed bytecode before contract use. Browser-wallet approval was not automated. |
| EnergyOffer contract | FIXED AND VERIFIED | Dashboard ABI matches the called `EnergyOffer` functions; 13 local Hardhat tests pass. The configured Sepolia address contains bytecode and `getOfferCount()` returned a valid value during read-only RPC verification. |
| Contract deployment | REQUIRES EXTERNAL CONFIGURATION | Deployment needs valid Sepolia RPC and a valid 32-byte private key. No deployment was run. |
| Solar prediction endpoint | FIXED AND VERIFIED | `/predict` now handles PythonShell v5 Promise behavior and returns structured errors. Without a compatible model it returns HTTP 503 with `MODEL_UNAVAILABLE`. |
| Trained solar model | NOT IMPLEMENTED | No `.pkl`, `.joblib`, or `.pickle` model artifact exists in the repository. The dashboard truthfully retains its clearly-labelled local estimate and does not claim ML output. |
| Wind and battery values | PARTIALLY WORKING | Values are simulations and are labelled accordingly; no real telemetry source is configured. |

## Verified configuration and source of truth

### Backend

Required `energichain_backend/.env` keys:

```text
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT
```

The application is served by:

```powershell
cd energichain_backend
node src/server.js
```

It runs at `http://localhost:5000` when `PORT=5000`.

### PostgreSQL

Required database: `energichain_db`.

Models and relationships:

- `User` has many `Trade` records.
- `User` is a booking customer or provider.
- `Booking` has many `BookingMessage` records.
- `BookingMessage` belongs to its booking and sender.

The backend does not drop, truncate, recreate, force-sync, or alter the existing schema during startup.

### Blockchain

The active dashboard configuration is:

```text
energichain_backend/public/config/contract_address.json
```

The dashboard fetches only `/config/contract_address.json`; this makes the public file above the sole source of truth for browser configuration. The legacy file at:

```text
energichain-contract/energichain_backend/public/config/contract-address.json
```

is not served or read by the frontend. It is retained but must not be used to configure the dashboard.

The configured chain is Sepolia (`11155111`, `0xaa36a7`). Read-only RPC verification found deployed bytecode at the configured address and a successful `getOfferCount()` call. This does not authorize or prove a user wallet transaction.

### ML

`model_train/Train_Generation.py` trains a Random Forest using these expected features:

```text
IRRADIATION, AMBIENT_TEMPERATURE, MODULE_TEMPERATURE,
hour_sin, hour_cos, minute_sin, minute_cos
```

The target is `AC_POWER`, and the training script writes `solar_rf_model.pkl`. `src/predict.py` now accepts that artifact from either `src/solar_rf_model.pkl` or `model_train/solar_rf_model.pkl`. Neither artifact currently exists, and `Solar_Data.csv` is also absent, so a production ML prediction cannot be enabled without an approved compatible dataset and newly trained artifact.

The separate FastAPI script `model_train/api.py` expects a different `solar_combined_model.pkl` bundle and different features. It is not compatible with the current dashboard input contract without an explicit adapter and model artifact.

## Identified issues and resolution

| Issue | Resolution / current state |
| --- | --- |
| `PythonShell.run` used a callback pattern incompatible with installed v5 | Fixed: server awaits the Promise and returns JSON errors. |
| `predict.py` expected stdin while Node supplied an argument | Fixed: script accepts its first JSON argument and retains stdin support. |
| Missing model artifact crashed Python at import time | Fixed: endpoint now returns explicit HTTP 503 `MODEL_UNAVAILABLE`; no heuristic is substituted by the API. |
| Invalid JSON returned Express HTML stack output | Fixed: global API JSON parse handler returns safe HTTP 400 JSON. |
| Malformed private key blocked all local Hardhat tests | Fixed: Sepolia is disabled unless both an RPC URL and a valid `0x` + 64 hexadecimal-character key exist. |
| Dashboard trusted any configured address | Fixed: it validates the address and checks for deployed bytecode before initializing marketplace contract use. |
| Duplicate contract configuration files | Documented: public backend config is authoritative; legacy nested file is ignored. |
| Earlier UI documentation describes obsolete UI behavior | The UI documentation predates later UI hardening and should be treated as a historical baseline. The live source and `README.md` are current references. |

## Tests actually executed

| Test | Result |
| --- | --- |
| Static frontend script parsing | PASS for landing, login, sign-up, and dashboard inline scripts. |
| Local application and Chart.js routes | PASS; root and frontend assets returned HTTP 200. |
| Booking API access control | PASS; unauthenticated booking access returned HTTP 401. |
| Booking lifecycle/message workflow | PASS; `npm run test:booking` reported `BOOKING_WORKFLOW=PASS` and removed its own temporary test data. |
| Python model-missing behavior | PASS; direct script output and `/predict` returned structured `MODEL_UNAVAILABLE` response. |
| Invalid prediction JSON handling | PASS; `/predict` returned HTTP 400 JSON without stack output. |
| EnergyOffer local contract tests | PASS; `npx hardhat test` reported 13 passing tests. |
| Read-only Sepolia address verification | PASS; configured address returned bytecode and supported `getOfferCount()`. |
| MetaMask user approval and transaction flows | NOT RUN; require an installed unlocked wallet and user approval. |
| Sepolia deployment | NOT RUN; changes blockchain state and was not authorized. |
| Trained model inference | BLOCKED; no compatible model artifact or training dataset is present. |

## Files modified during this audit

- `energichain_backend/src/predict.py` — model path handling, safe missing-model response, PythonShell argument support.
- `energichain_backend/src/server.js` — Promise-based PythonShell execution and consistent prediction status codes.
- `energichain_backend/src/app.js` — safe JSON parse errors.
- `energichain_backend/public/dashboard.html` — contract address and bytecode verification before wallet contract initialization.
- `energichain-contract/hardhat.config.js` — valid private-key gate for Sepolia; local tests remain credential-free.
- `energichain-contract/README.md` — contract workflow and source-of-truth clarification.
- `README.md` — current install, execution, testing, configuration, and safety instructions.

## Remaining requirements

1. Supply PostgreSQL credentials and a database for normal backend use.
2. For live wallet operations, install/unlock MetaMask and use Sepolia.
3. For deployment only, supply a valid Sepolia RPC URL and a dedicated test-wallet private key in `energichain-contract/.env`.
4. For trained solar predictions, provide the compatible training dataset and create `model_train/solar_rf_model.pkl`; do not replace it with the incompatible combined model without an adapter.
5. Do not deploy contracts, overwrite contract addresses, or run real Sepolia transactions without explicit approval.

## Energy Consumption ML module (November 18, 2026)

| Item | Status | Evidence |
| --- | --- | --- |
| Dataset validation | IMPLEMENTED AND TESTED | `data/Energy_consumption.csv` has 1,000 rows, 11 required columns, zero missing required values, zero duplicate rows, and valid timestamps from January 1 through February 11, 2022. |
| Time-aware preprocessing | IMPLEMENTED AND TESTED | `model_train/energy_consumption_features.py` validates raw values, normalizes categorical inputs, and derives hour/day/month/weekend features. |
| Model comparison | IMPLEMENTED AND TESTED | `train_energy_consumption.py` uses the first 80% of chronological rows for training and the final 20% for validation. |
| Saved model | IMPLEMENTED AND TESTED | `model_train/energy_consumption_model.pkl` contains the selected fitted preprocessing/model pipeline. |
| Metadata/report | IMPLEMENTED AND TESTED | `energy_consumption_model_metadata.json` and `energy_consumption_model_report.md` record ranges, periods, features, and validation metrics. |
| Consumption API | IMPLEMENTED AND TESTED | `POST /api/energy-consumption/predict` returns JSON success, validation errors, model errors, and out-of-range warnings. |
| Dashboard tab | IMPLEMENTED AND TESTED | A separate **Consumption** tab adds the requested form, reset control, result surface, warnings, and a one-point prediction chart. |
| Solar module | PRESERVED | Existing `/predict` and solar dashboard behavior are unchanged. |

### Chronological validation results

| Candidate | MAE | MSE | RMSE | R² |
| --- | ---: | ---: | ---: | ---: |
| Linear Regression | 4.1222 | 25.0182 | 5.0018 | 0.5917 |
| Random Forest Regressor | 4.1974 | 26.5281 | 5.1505 | 0.5671 |
| Gradient Boosting Regressor | 4.0979 | 25.2387 | 5.0238 | 0.5881 |

`LinearRegression` was selected because it achieved the lowest validation RMSE. `EnergyConsumption` has no unit declaration in the supplied dataset; the UI and API therefore use `dataset-defined unit (not specified)` rather than fabricate a unit. This small, single-dataset model is not presented as production-ready.

## Marketplace acceptance investigation (November 18, 2026)

The configured Sepolia `EnergyOffer` contract reports 17 offers. IDs 0–3 are active and their exact on-chain values match the visible 0.01, 0.012, 0.04, and 0.05 ETH prices.

However, the live contract does not expose the ownership read methods present in the current repository artifact, and a read-only `acceptOffer(0)` simulation from the public wallet that created offer #1 (which held 0.6434 Sepolia ETH) reverted. This confirms a legacy deployed-contract incompatibility or state issue; it is not resolved by only changing the browser button.

The dashboard now preserves exact wei-priced offer values, checks that the connected wallet has at least the offer amount before prompting MetaMask, and calls `acceptOffer.staticCall` before sending a transaction. When the live contract rejects the preflight, the UI reports that no transaction was sent and that the legacy offer cannot currently be accepted.

No deployment, address overwrite, transaction, or contract-state mutation was performed during this investigation. Remediation requires explicit approval to deploy/verify a compatible `EnergyOffer` contract and update the public contract-address configuration only after deployment succeeds.

## Safe Sepolia marketplace migration (November 18, 2026)

### Compatibility report

| Item | Status | Finding |
| --- | --- | --- |
| Configured legacy address | VERIFIED | `0xe026E90518516bDEb48c9F585c16a3FFBf21fDaE` on Sepolia (`11155111`). |
| Legacy runtime bytecode | VERIFIED | Bytecode was present (6,440 bytes during the read-only audit). |
| Legacy offer count | VERIFIED | `getOfferCount()` returned `17`. |
| Dashboard legacy ABI | VERIFIED | The browser uses create/get/cancel/accept/get-active-offers methods listed in `migrations/legacy-sepolia-energyoffer-snapshot.json`. |
| Ownership reads | VERIFIED INCOMPATIBLE | Calls to `getOwnerAddress(uint256)` and `ownerOfOffer(uint256)` reverted against the deployed legacy runtime, although the current repository source exposes ownership tracking. |
| Cross-seller acceptance | VERIFIED INCOMPATIBLE | A read-only `acceptOffer(0)` simulation from a different funded Sepolia wallet reverted. No transaction was sent. The exact legacy inner cause cannot be asserted because no verified legacy source is available. |
| Multiple address files | VERIFIED | `energichain_backend/public/config/contract_address.json` is authoritative. The nested hyphenated legacy configuration is not served or used. |

**Root cause:** the current Sepolia bytecode is not compatible with the repository `EnergyOffer.sol` ABI/ownership implementation. Therefore a browser-only Accept-button change cannot repair the old marketplace. The active address remains the legacy address until a separately approved replacement is deployed and verified.

### Preserved historical offers

The complete durable snapshot, including user hashes, exact wei values, timestamps, creation transactions, and block numbers, is [legacy-sepolia-energyoffer-snapshot.json](energichain-contract/migrations/legacy-sepolia-energyoffer-snapshot.json). The legacy tuple contains no energy-quantity/energy-ID field, so that value is explicitly recorded as unavailable rather than invented.

| Legacy ID | Seller | ETH | Active at audit | Creation transaction |
| ---: | --- | ---: | --- | --- |
| 0 | `0xFDF5…c8f9D` | 0.01 | yes | `0xffe959…8b6016` |
| 1 | `0xEf424…2681` | 0.012 | yes | `0x954bb3…3800ca` |
| 2 | `0xFDF5…c8f9D` | 0.04 | yes | `0x467ccf…07ea2b` |
| 3 | `0xFDF5…c8f9D` | 0.05 | yes | `0xb57e90…0ffa0b` |
| 4 | `0xFDF5…c8f9D` | 0.09 | yes | `0x76ece8…dc33cf` |
| 5 | `0xEf424…2681` | 0.01 | yes | `0x9e19a4…dc0602` |
| 6 | `0xEf424…2681` | 0.05 | yes | `0x319e03…7123de` |
| 7 | `0xFDF5…c8f9D` | 0.04 | yes | `0xc46ddd…0c61db` |
| 8 | `0xEf424…2681` | 0.2 | yes | `0xd31a81…eb006f` |
| 9 | `0xFDF5…c8f9D` | 0.02 | yes | `0xbea85a…379cc4` |
| 10 | `0xEf424…2681` | 0.03 | yes | `0x9ff5aa…a8e28c` |
| 11 | `0xFDF5…c8f9D` | 0.05 | yes | `0xfd3fa8…08a186` |
| 12 | `0xFDF5…c8f9D` | 0.08 | yes | `0xbe772b…3486b6` |
| 13 | `0xFDF5…c8f9D` | 0.03 | yes | `0xf80b33…bf3a4b` |
| 14 | `0xFDF5…c8f9D` | 0.03 | yes | `0xbb6cc2…fdfc17` |
| 15 | `0xEf424…2681` | 0.01 | no | `0xd9728e…b9fba5` |
| 16 | `0xEf424…2681` | 0.01 | yes | `0xdb25a9…72682b` |

### Implemented repair and dashboard safety

| Item | Status | Details |
| --- | --- | --- |
| Compatible `EnergyOffer` implementation | IMPLEMENTED | Seller wallets are persisted in `ownerOfOffer`; the existing minimum price, exact-price payment, cancellation, active-state, and events are preserved. |
| Settlement reentrancy guard | IMPLEMENTED | `acceptOffer` is protected by a lock while retaining checks-effects-interactions. |
| Ownership ABI | IMPLEMENTED | `getOwnerAddress(uint256)` is available and the dashboard uses it for seller display and self-purchase checks on the replacement contract. |
| Legacy history | IMPLEMENTED | `contract_history.json` identifies the old address as historical-only; the dashboard fetches and renders its snapshot separately without action buttons. |
| Legacy transaction prevention | IMPLEMENTED | While the authoritative address is the known legacy address, creation, cancellation, and acceptance controls are disabled and the page explains that migration approval is pending. |
| Purchase preflight for replacement contract | IMPLEMENTED | Wallet, Sepolia network, address, bytecode, offer state, seller identity, static simulation, price-plus-estimated-gas balance, transaction receipt, and refresh are checked before success is reported. |
| Automatic offer migration | NOT IMPLEMENTED | No offers are recreated, no seller is impersonated, and no legacy ID is reused. Any future recreation requires the original seller's authorization. |

### Test and deployment status

| Item | Status | Result |
| --- | --- | --- |
| Local Hardhat tests | VERIFIED | `npx hardhat test`: 17 passing. Coverage includes deployment, minimum price, ownership, retrieval, cancellation authorization, self-purchase, wrong payment, payment transfer, event emission, repeat acceptance, and a recipient reentrancy attempt. |
| Dashboard script parsing | VERIFIED | The dashboard inline script parses successfully after the historical marketplace change. |
| JSON configuration | VERIFIED | Active-address, history, and migration-snapshot JSON parse successfully. |
| Deployment guard | VERIFIED | Running `npx hardhat run scripts/deploy.js` without `CONFIRM_SEPOLIA_DEPLOYMENT=true` exits before deployment or configuration mutation. |
| New Sepolia deployment | PENDING APPROVAL | No deployment transaction has been sent; no new address or transaction hash exists. |
| Active address update | PENDING APPROVAL | `contract_address.json` continues to point to the old contract. The guarded script updates it only after a successful approved deployment and bytecode/function checks. |
| Buyer-to-seller Sepolia test | NOT IMPLEMENTED | Requires the approved deployment, then two user-controlled test wallets and a small newly created test offer. |

### Deployment checklist (approval checkpoint)

1. Place a valid `SEPOLIA_RPC_URL` and a dedicated 32-byte `PRIVATE_KEY` in `energichain-contract/.env`; do not share the key in chat.
2. Ensure that wallet has enough SepoliaETH for the deployment estimate.
3. Review the new `EnergyOffer.sol`, tests, and snapshot above.
4. Give an explicit deployment approval. Only then run: `CONFIRM_SEPOLIA_DEPLOYMENT=true npx hardhat run scripts/deploy.js --network sepolia`.
5. Confirm the generated deployment report, on-chain bytecode, and updated active address before testing a seller-created 0.01 SepoliaETH offer with a separate buyer wallet.
