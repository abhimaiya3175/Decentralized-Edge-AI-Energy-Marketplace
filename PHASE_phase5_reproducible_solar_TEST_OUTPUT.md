# Phase 5: Reproducible Solar Model Training Test Evidence

Execution Date: 2026-11-21T03:12:00+05:30
Environment: Windows (pwsh), Node v22.14.0, Python 3.12, DB_NAME=energichain_test

## 1. Solar Training Pipeline Test (Missing Dataset Guard & Zero Data Fabrication)

Command: `npm run train:solar` inside `energichain_backend`

```
> energichain_backend@1.0.0 train:solar
> python model_train/train_solar_reproducible.py

==============================================================================
MISSING SOLAR DATASET ERROR — DATA FABRICATION IS STRICTLY PROHIBITED
==============================================================================
The reproducible solar training pipeline requires the real public Kaggle
'Solar Power Generation Data' dataset.

Missing required file(s):
  - E:\ProJect\Decentralized-Edge-AI-Energy-Marketplace-main\Decentralized-Edge-AI-Energy-Marketplace-main\energichain_backend\data\Plant_1_Generation_Data.csv
  - E:\ProJect\Decentralized-Edge-AI-Energy-Marketplace-main\Decentralized-Edge-AI-Energy-Marketplace-main\energichain_backend\data\Plant_1_Weather_Sensor_Data.csv

Download instructions:
1. Visit: https://www.kaggle.com/datasets/anikannal/solar-power-generation-data
2. Download 'Plant_1_Generation_Data.csv' and 'Plant_1_Weather_Sensor_Data.csv'
3. Place both CSV files into: E:\ProJect\Decentralized-Edge-AI-Energy-Marketplace-main\Decentralized-Edge-AI-Energy-Marketplace-main\energichain_backend\data
4. Re-run: npm run train:solar (or python model_train/train_solar_reproducible.py)
==============================================================================

Execution terminated: Missing solar dataset: E:\ProJect\Decentralized-Edge-AI-Energy-Marketplace-main\Decentralized-Edge-AI-Energy-Marketplace-main\energichain_backend\data\Plant_1_Generation_Data.csv, E:\ProJect\Decentralized-Edge-AI-Energy-Marketplace-main\Decentralized-Edge-AI-Energy-Marketplace-main\energichain_backend\data\Plant_1_Weather_Sensor_Data.csv
```
Result: Process exits cleanly with exit code 1 and actionable error message. No fake or placeholder data is generated.

---

## 2. Hardhat Test Suite (Real Escrow State Machine)

Command: `npx hardhat test` inside `energichain-contract`

```
  EnergyOffer (Escrow State Machine)
    √ deploys with an empty offer list and zero initial offers (72ms)
    √ creates an open offer with quantity, price, and delivery window, deriving seller from msg.sender (70ms)
    √ rejects zero quantity, zero price, past delivery window, and excessive delivery window (49ms)
    √ allows only the seller to cancel an open offer and emits OfferCancelled (46ms)
    √ rejects self-purchase, incorrect payment, invalid IDs, and expired delivery window
    √ locks exact buyer funds into escrow (not sent to seller yet) and emits OfferLocked (43ms)
    √ buyer confirms delivery, releasing escrowed funds to seller
    √ allows seller to claim payment after delivery window and grace period timeout (41ms)
    √ allows buyer to claim full refund if seller fails to mark delivery fulfilled
    √ prevents settlement reentrancy from a payment recipient during escrow release (38ms)

  Lock
    Deployment
      √ Should set the right unlockTime (52ms)
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

  19 passing (569ms)
```

---

## 3. Backend Test Suites (Dedicated Test Database `energichain_test`)

### A. Booking Workflow Suite (`npm run test:booking`)
```
BOOKING_WORKFLOW=PASS
BOOKING_WORKFLOW_TEST_DATA=REMOVED
```

### B. Auth & Wallet Verification Suite (`npm run test:auth-wallet`)
```
AUTH_WALLET_TEST=PASS
AUTH_WALLET_TEST_DATA=REMOVED
```

### C. API Smoke Suite (`npm run test:smoke`)
```
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

### D. Energy Consumption ML Unit Suite (`npm run test:consumption`)
```
test_feature_normalisation_accepts_binary_api_values (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_missing_artifact_is_safe (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_missing_field_is_validation_error (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_out_of_training_range_returns_warning (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok
test_valid_request_returns_prediction (model_train.test_energy_consumption.EnergyConsumptionModelTests) ... ok

----------------------------------------------------------------------
Ran 5 tests in 1.226s

OK
```

### E. Security Hardening Suite (`npm run test:security`)
```
Security verification test server running on port 5055

--- TEST 1: Helmet CSP Verification ---
CSP header on /login.html => PASS (Tailwind, inline, WS allowed; unpkg & unsafe-eval removed)
CSP header on /signup.html => PASS (Tailwind, inline, WS allowed; unpkg & unsafe-eval removed)
CSP header on /dashboard.html => PASS (Tailwind, inline, WS allowed; unpkg & unsafe-eval removed)

--- TEST 2: CORS Verification ---
CORS No-Origin Header => PASS (Allowed through to endpoint)
CORS Allowed Origin (http://localhost:3000) => PASS (Allowed)
CORS Unauthorized Origin => PASS (403 CORS_FORBIDDEN)

--- TEST 3: Password Policy UX & Legacy Login ---
Signup Password Policy Enforcement => PASS (400 PASSWORD_POLICY_VIOLATION)
Legacy User Login with Older Password => PASS (200 OK with valid JWT)
Bcrypt Timing Check => User not found: 66ms, User found wrong pw: 67ms
Dummy Bcrypt Constant-Time Check => PASS (Both executed full bcrypt comparison)

--- TEST 4: Rate Limiting & Proxy IP Bucket Isolation ---
Forwarded Client IP A (198.51.100.1) rate-limited on request 4 => PASS (429)
Forwarded Client IP B (198.51.100.2) fresh bucket not blocked => PASS (401 instead of 429)

--- TEST 5: Python Subprocess Timeout & PID Cleanup ---
Python Subprocess Timeout & PID Termination => PASS (504 INFERENCE_TIMEOUT, PID 4900 confirmed terminated: ESRCH)

--- TEST 6: Subprocess Concurrency Semaphore ---
Concurrency Limit Reached (5/5) => PASS (Immediate 503 INFERENCE_BUSY)

ALL SECURITY HARDENING TESTS PASSED SUCCESSFULLY
```

---

## 4. Next.js Frontend Production Build

Command: `cd energichain_frontend && npm run build`

```
  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/13) ...
   Generating static pages (3/13) 
   Generating static pages (6/13) 
   Generating static pages (9/13) 
 ✓ Generating static pages (13/13)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    175 B          96.2 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ○ /dashboard                           5.57 kB         198 kB
├ ○ /dashboard/bookings                  7.98 kB        95.3 kB
├ ○ /dashboard/consumption               2.91 kB        90.2 kB
├ ○ /dashboard/history                   5.25 kB         189 kB
├ ○ /dashboard/marketplace               7.01 kB         191 kB
├ ○ /dashboard/solar                     2.7 kB           90 kB
├ ○ /dashboard/wind                      1.52 kB        88.8 kB
├ ○ /login                               139 B          99.4 kB
└ ○ /signup                              139 B          99.4 kB
+ First Load JS shared by all            87.3 kB
  ├ chunks/117-b265954a20e9f4be.js       31.7 kB
  ├ chunks/fd9d1056-12d0224c61359539.js  53.6 kB
  └ other shared chunks (total)          1.95 kB

○  (Static)  prerendered as static content
```
