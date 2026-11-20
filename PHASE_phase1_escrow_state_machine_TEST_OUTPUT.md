# EnergyChain — Phase 1 Escrow State Machine Test Execution Results

**Date**: 2026-11-21  
**Git Branch**: `review-fixes`  
**Phase**: Phase 1 — Real Escrow Contract (`EnergyOffer.sol`) State Machine  
**Dedicated Test DB**: `energichain_test` (PostgreSQL)  

---

## 1. Smart Contract Tests (`energichain-contract`)

Command: `cd energichain-contract && npx hardhat test`

```
  EnergyOffer (Escrow State Machine)
    √ deploys with an empty offer list and zero initial offers (62ms)
    √ creates an open offer with quantity, price, and delivery window, deriving seller from msg.sender (52ms)
    √ rejects zero quantity, zero price, past delivery window, and excessive delivery window (38ms)
    √ allows only the seller to cancel an open offer and emits OfferCancelled (39ms)
    √ rejects self-purchase, incorrect payment, invalid IDs, and expired delivery window
    √ locks exact buyer funds into escrow (not sent to seller yet) and emits OfferLocked (38ms)
    √ buyer confirms delivery, releasing escrowed funds to seller
    √ allows seller to claim payment after delivery window and grace period timeout (39ms)
    √ allows buyer to claim full refund if seller fails to mark delivery fulfilled (42ms)
    √ prevents settlement reentrancy from a payment recipient during escrow release

  Lock
    Deployment
      √ Should set the right unlockTime
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

  19 passing (476ms)
```

---

## 2. Pre-Booking Bilateral Workflow Test (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:booking`

```
> energichain_backend@1.0.0 test:booking
> node scripts/verify-booking-workflow.js

BOOKING_WORKFLOW=PASS
BOOKING_WORKFLOW_TEST_DATA=REMOVED
```

---

## 3. Cryptographic EIP-191 Auth & Wallet Binding Test (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:auth-wallet`

```
> energichain_backend@1.0.0 test:auth-wallet
> node scripts/verify-auth-wallet.js

AUTH_WALLET_TEST=PASS
AUTH_WALLET_TEST_DATA=REMOVED
```

---

## 4. Backend API Smoke Test Suite (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:smoke`

```
> energichain_backend@1.0.0 test:smoke
> node scripts/verify-api-smoke.js

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
Ran 5 tests in 1.333s

OK
```

---

## 6. Security Hardening Verification Suite (`energichain_backend`)

Command: `cd energichain_backend && DB_NAME=energichain_test npm run test:security`

```
> energichain_backend@1.0.0 test:security
> node scripts/verify-security-hardening.js

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
Bcrypt Timing Check => User not found: 66ms, User found wrong pw: 65ms
Dummy Bcrypt Constant-Time Check => PASS (Both executed full bcrypt comparison)

--- TEST 4: Rate Limiting & Proxy IP Bucket Isolation ---
Forwarded Client IP A (198.51.100.1) rate-limited on request 4 => PASS (429)
Forwarded Client IP B (198.51.100.2) fresh bucket not blocked => PASS (401 instead of 429)

--- TEST 5: Python Subprocess Timeout & PID Cleanup ---
Python Subprocess Timeout & PID Termination => PASS (504 INFERENCE_TIMEOUT, PID 9112 confirmed terminated: ESRCH)

--- TEST 6: Subprocess Concurrency Semaphore ---
Concurrency Limit Reached (5/5) => PASS (Immediate 503 INFERENCE_BUSY)

ALL SECURITY HARDENING TESTS PASSED SUCCESSFULLY
```

---

## 7. Next.js Frontend Production Build (`energichain_frontend`)

Command: `cd energichain_frontend && npm run build`

```
  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
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

○  (Static)  prerendered as static content
```
