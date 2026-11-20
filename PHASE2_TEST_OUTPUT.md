# EnergyChain — Phase 2 Test Execution Results

**Date**: 2026-11-21  
**Git Branch**: `review-fixes`  
**Phase**: Phase 2 — Backend Security Hardening  
**Baseline Tag**: `baseline` (Commit `f2487886c70c4a456853cab609a36760c28c124f`)

---

## 1. Smart Contract Tests (`energichain-contract`)

Command: `cd energichain-contract && npx hardhat test`

```
  EnergyOffer
    √ deploys with the intended minimum price and an empty offer list (627ms)
    √ creates an active offer and records its owner (118ms)
    √ rejects an offer below the configured minimum price (105ms)
    √ allows only the owner to cancel an active offer (68ms)
    √ rejects self-purchase, incorrect payment, and invalid offer IDs (42ms)
    √ settles a correctly funded offer, transfers payment, emits, and deactivates it (106ms)
    √ emits the acceptance event with the buyer and price (52ms)
    √ prevents settlement reentrancy from a payment recipient (75ms)

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

  17 passing (1s)
```

---

## 2. Pre-Booking Bilateral Workflow Test (`energichain_backend`)

Command: `cd energichain_backend && npm run test:booking`

```
> energichain_backend@1.0.0 test:booking
> node scripts/verify-booking-workflow.js

[dotenv@17.2.3] injecting env (7) from .env
BOOKING_WORKFLOW=PASS
BOOKING_WORKFLOW_TEST_DATA=REMOVED
```

---

## 3. Cryptographic EIP-191 Auth & Wallet Binding Test (`energichain_backend`)

Command: `cd energichain_backend && npm run test:auth-wallet`

```
> energichain_backend@1.0.0 test:auth-wallet
> node scripts/verify-auth-wallet.js

[dotenv@17.2.3] injecting env (7) from .env
AUTH_WALLET_TEST=PASS
AUTH_WALLET_TEST_DATA=REMOVED
```

---

## 4. Backend API Smoke Test Suite (`energichain_backend`)

Command: `cd energichain_backend && npm run test:smoke`

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
Ran 5 tests in 1.292s

OK
```
