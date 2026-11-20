# EnergyChain — Phase 2 Test Execution Results (Verified Run)

**Date**: 2026-11-21  
**Git Branch**: `review-fixes`  
**Phase**: Phase 2 — Backend Security Hardening & Corrections  
**Dedicated Test DB**: `energichain_test` (PostgreSQL)  
**Baseline Tag**: `baseline` (Commit `f2487886c70c4a456853cab609a36760c28c124f`)

---

## 1. Smart Contract Tests (`energichain-contract`)

Command: `cd energichain-contract && npx hardhat test`

```
[dotenv@17.2.3] injecting env (3) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }


  EnergyOffer
    √ deploys with the intended minimum price and an empty offer list (705ms)
    √ creates an active offer and records its owner (155ms)
    √ rejects an offer below the configured minimum price (124ms)
    √ allows only the owner to cancel an active offer (57ms)
    √ rejects self-purchase, incorrect payment, and invalid offer IDs (52ms)
    √ settles a correctly funded offer, transfers payment, emits, and deactivates it (143ms)
    √ emits the acceptance event with the buyer and price (79ms)
    √ prevents settlement reentrancy from a payment recipient (70ms)

  Lock
    Deployment
      √ Should set the right unlockTime (50ms)
      √ Should set the right owner
      √ Should receive and store the funds to lock
      √ Should fail if the unlockTime is not in the future
    Withdrawals
      Validations
        √ Should revert with the right error if called too soon
        √ Should revert with the right error if called from another account
        √ Shouldn't fail if the unlockTime has arrived and the owner calls it
      Events
        √ Should emit an event on withdrawals
      Transfers
        √ Should transfer the funds to the owner


  17 passing (2s)

··············································································································
|  Solidity and Network Configuration                                                                        │
·························|·················|···············|·················|································
|  Solidity: 0.8.0       ·  Optim: false   ·  Runs: 200    ·  viaIR: false   ·     Block: 30,000,000 gas     │
·························|·················|···············|·················|································
|  Methods                                                                                                   │
·························|·················|···············|·················|················|···············
|  Contracts / Methods   ·  Min            ·  Max          ·  Avg            ·  # calls       ·  usd (avg)   │
·························|·················|···············|·················|················|···············
|  EnergyOffer           ·                                                                                   │
·························|·················|···············|·················|················|···············
|      acceptOffer       ·         45,794  ·       60,879  ·         48,308  ·             6  ·           -  │
·························|·················|···············|·················|················|···············
|      cancelOffer       ·              -  ·            -  ·         30,731  ·             2  ·           -  │
·························|·················|···············|·················|················|···············
|      createOffer       ·              -  ·            -  ·        182,418  ·             7  ·           -  │
·························|·················|···············|·················|················|···············
|  Lock                  ·                                                                                   │
·························|·················|···············|·················|················|···············
|      withdraw          ·              -  ·            -  ·         34,096  ·             7  ·           -  │
·························|·················|···············|·················|················|···············
|  ReentrantSeller       ·                                                                                   │
·························|·················|···············|·················|················|···············
|      configureReentry  ·              -  ·            -  ·         46,331  ·             1  ·           -  │
·························|·················|···············|·················|················|···············
|      createOffer       ·              -  ·            -  ·        171,772  ·             1  ·           -  │
·························|·················|···············|·················|················|···············
|  Deployments                             ·                                 ·  % of limit    ·              │
·························|·················|···············|·················|················|···············
|  EnergyOffer           ·              -  ·            -  ·      1,383,180  ·         4.6 %  ·           -  │
·························|·················|···············|·················|················|···············
|  Lock                  ·              -  ·            -  ·        320,584  ·         1.1 %  ·           -  │
·························|·················|···············|·················|················|···············
|  ReentrantSeller       ·              -  ·            -  ·        394,534  ·         1.3 %  ·           -  │
·························|·················|···············|·················|················|···············
|  Key                                                                                                       │
··············································································································
|  ◯  Execution gas for this method does not include intrinsic gas overhead                                  │
··············································································································
|  △  Cost was non-zero but below the precision setting for the currency display (see options)               │
··············································································································
|  Toolchain:  hardhat                                                                                       │
··············································································································
```

---

## 2. Pre-Booking Bilateral Workflow Test (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:booking`

```
> energichain_backend@1.0.0 test:booking
> node scripts/verify-booking-workflow.js

[dotenv@17.2.3] injecting env (6) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops
BOOKING_WORKFLOW=PASS
BOOKING_WORKFLOW_TEST_DATA=REMOVED
```

---

## 3. Cryptographic EIP-191 Auth & Wallet Binding Test (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:auth-wallet`

```
> energichain_backend@1.0.0 test:auth-wallet
> node scripts/verify-auth-wallet.js

[dotenv@17.2.3] injecting env (6) from .env -- tip: ⚙️  enable debug logging with { debug: true }
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  write to custom object with { processEnv: myObject }
AUTH_WALLET_TEST=PASS
AUTH_WALLET_TEST_DATA=REMOVED
```

---

## 4. Backend API Smoke Test Suite (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:smoke`

```
> energichain_backend@1.0.0 test:smoke
> node scripts/verify-api-smoke.js

[dotenv@17.2.3] injecting env (6) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
Smoke test server running on port 5000
SMOKE 1: Contract Address Config => PASS
SMOKE 2: Legacy Sepolia Snapshot => PASS
SMOKE 3: Unauthenticated /auth/me => PASS (401 TOKEN_MISSING)
SMOKE 3a: Unauthenticated /api/energy-consumption/predict => PASS (401 TOKEN_MISSING)
SMOKE 3b: Unauthenticated /predict => PASS (401 TOKEN_MISSING)
SMOKE 4: Authenticated Consumption ML Prediction => PASS (86.8243 dataset-defined unit (not specified))
SMOKE 5: Authenticated Solar ML Offline Graceful 503 => PASS (MODEL_UNAVAILABLE)
ALL SMOKE TESTS PASSED SUCCESSFULLY
```

---

## 5. Energy Consumption ML Unit Test Suite (`energichain_backend`)

Command: `cd energichain_backend && npm run test:consumption`

```
> energichain_backend@1.0.0 test:consumption
> python -m unittest model_train/test_energy_consumption.py -v

test_feature_normalisation_accepts_binary_api_values (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_missing_artifact_is_safe (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_missing_field_is_validation_error (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_out_of_training_range_returns_warning (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_valid_request_returns_prediction (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok

----------------------------------------------------------------------
Ran 5 tests in 1.174s

OK
```

---

## 6. Security Hardening Verification Suite (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:security`

```
> energichain_backend@1.0.0 test:security
> node scripts/verify-security-hardening.js

[dotenv@17.2.3] injecting env (6) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops
Security verification test server running on port 5055

--- TEST 1: Helmet CSP Verification ---
CSP header on /login.html => PASS (Tailwind, inline, WS, self permitted)
CSP header on /signup.html => PASS (Tailwind, inline, WS, self permitted)
CSP header on /dashboard.html => PASS (Tailwind, inline, WS, self permitted)

--- TEST 2: CORS Verification ---
CORS No-Origin Header => PASS (Allowed through to endpoint)
CORS Allowed Origin (http://localhost:3000) => PASS (Allowed)
CORS Unauthorized Origin => PASS (403 CORS_FORBIDDEN)

--- TEST 3: Password Policy UX & Legacy Login ---
Signup Password Policy Enforcement => PASS (400 PASSWORD_POLICY_VIOLATION)
Legacy User Login with Older Password => PASS (200 OK with valid JWT)

--- TEST 4: Rate Limiting Verification ---
Rate Limiting (Triggered 429 on rapid request 3 with limit=3) => PASS (429 AUTH_RATE_LIMITED)

--- TEST 5: Python Subprocess Timeout & PID Cleanup ---
Python Subprocess Timeout & PID Termination => PASS (504 INFERENCE_TIMEOUT, PID 9020 confirmed terminated: ESRCH)

--- TEST 6: Subprocess Concurrency Semaphore ---
Concurrency Limit Reached (5/5) => PASS (Immediate 503 INFERENCE_BUSY)

ALL SECURITY HARDENING TESTS PASSED SUCCESSFULLY
```
