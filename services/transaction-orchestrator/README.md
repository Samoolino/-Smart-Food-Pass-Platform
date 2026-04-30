# Transaction Orchestrator

The Transaction Orchestrator coordinates VICTUALS package acquisition, in-app `$WO` accounting, pass wallet utility, merchant redemption, and merchant conversion requests.

## Core principles

- Email and password can grant basic app account access.
- Wallet utility and transaction approval require an accreditation reference such as BVN/NIN verification or another approved provider reference.
- Raw sensitive identity numbers must not be stored in the app domain model.
- `$WO` is an in-app accounting unit used for plan value, pass value, QR worth, merchant transaction approval, and conversion requests.
- `$WO` availability is governed by treasury release policy and approved inflow/backing references.

## Main flows

1. Package acquisition
   - Subscriber pays or funds a package through fiat, stablecoin, or another approved asset route.
   - The system calculates the `$WO` value and creates a package acquisition transaction.
   - The pass wallet receives `$WO` value after funding and release checks.

2. User redemption
   - User authenticates with account login.
   - User transaction utility is checked through accreditation state.
   - Active passes are combined into a pass set.
   - Product and nutrition engines calculate basket eligibility.
   - Redemption service creates `passSetHash`, `nutritionScopeHash`, `basketHash`, and signed redemption intent.

3. Merchant settlement and conversion
   - Merchant receives `$WO` value after redemption capture.
   - Merchant can request conversion to fiat or another approved asset.
   - Settlement service groups eligible credits into settlement batches.

4. Admin treasury operation
   - Admin reviews treasury policy, reserve limits, release windows, and available `$WO` capacity.
   - Admin can monitor operation records and release availability for plan issuance.

## Boundaries

This service coordinates domain state. It should not directly perform regulated banking, identity verification, or asset conversion. Provider-specific work belongs behind adapter interfaces.
