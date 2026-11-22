# EnergyChain — Baseline Test Execution Results

**Date**: 2026-11-21  
**Git Branch**: `review-fixes`  
**Git Tag**: `baseline` (Commit `f2487886c70c4a456853cab609a36760c28c124f`)

---

## 1. Smart Contract Tests (`energichain-contract`)

Command: `cd energichain-contract && npx hardhat test`

```
  EnergyOffer
    √ deploys with the intended minimum price and an empty offer list (48ms)
    √ creates an active offer and records its owner (45ms)
    √ rejects an offer below the configured minimum price
    √ allows only the owner to cancel an active offer
    √ rejects self-purchase, incorrect payment, and invalid offer IDs
    √ settles a correctly funded offer, transfers payment, emits, and deactivates it (40ms)
    √ emits the acceptance event with the buyer and price
    √ prevents settlement reentrancy from a payment recipient (38ms)

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

  17 passing (345ms)
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
SMOKE 4: Consumption ML Prediction => PASS (86.8243 dataset-defined unit (not specified))
SMOKE 5: Solar ML Offline Graceful 503 => PASS (MODEL_UNAVAILABLE)
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
Ran 5 tests in 2.192s

OK
```

---

## Contract Tests Replaced in Phase 1 (Explicit List)

In Phase 1, the immediate-transfer functions in `EnergyOffer.sol` will be replaced by an explicit state machine escrow. The following tests from the baseline will be replaced by state machine escrow equivalents:

1. `deploys with the intended minimum price and an empty offer list` -> Replaced with state machine escrow deployment test (zero offers, default timeout parameters).
2. `creates an active offer and records its owner` -> Replaced by offer creation with energy quantity (`kwh`), price in wei, and `deliveryWindow`.
3. `rejects an offer below the configured minimum price` -> Replaced with validation ensuring positive non-zero quantity and price.
4. `settles a correctly funded offer, transfers payment, emits, and deactivates it` -> Replaced by **Phase 1 Escrow Lifecycle**:
   - `acceptOffer`: locks buyer payment in contract escrow (funds NOT sent to seller yet).
   - `confirmDelivery`: buyer confirms delivery, releasing funds to seller.
   - `claimTimeoutPayment`: seller claims payment if buyer does not confirm within grace window.
   - `claimRefund`: buyer claims refund if seller fails to deliver within delivery window.
5. `emits the acceptance event with the buyer and price` -> Replaced by escrow lock event `OfferLocked(offerId, buyer, price, deliveryWindow)`.
6. `prevents settlement reentrancy from a payment recipient` -> Replaced with reentrancy protection on `confirmDelivery`, `claimTimeoutPayment`, `claimRefund`, and withdrawal paths.
