# VICTUALS Domain Architecture

VICTUALS is organized around a controlled domain model. The platform should be implemented from domain truth outward, not from the frontend inward.

## Core domains

1. **Subscription Plans**
   - Defines plan amount, recurrence, validity, target nutrition category, purchaser, and allowed redemption rules.
   - Supports family, welfare, CSR, relief, maternal nutrition, infant support, school feeding, and general nutritional access plans.

2. **Victuals Pass Wallet**
   - Holds user entitlement credits.
   - Receives scheduled credits according to plan terms.
   - Supports carryover and expiry windows.
   - Does not directly replace regulated payment account infrastructure.

3. **Nutritional Intelligence Engine**
   - Validates products against plan rules.
   - Suggests baskets using product nutrition, proximate composition, price, availability, and user feedback.
   - Guides access without making medical claims.

4. **Product Registry**
   - Stores VICTUALS-normalized product records.
   - References external nutrition, barcode, regulatory, and merchant inventory sources.
   - Maintains confidence scoring and admin approval states.

5. **Accredited Merchant Registry**
   - Registers merchants after onboarding, agreement, inventory validation, and settlement profile setup.
   - Controls which merchants can accept pass redemptions.

6. **Redemption and QR Authorization**
   - User selects eligible products from the pass inquiry flow.
   - System produces a signed redemption intent with basket hash, value limit, expiry, and nonce.
   - Merchant validates the signed intent before confirming redemption.

7. **Settlement and Ledger**
   - Internal ledger records pass debits, merchant credits, reversals, and settlement batches.
   - Merchant payout is handled through approved payment or fintech rails.

8. **Contract Truth Boundary**
   - Smart contracts anchor plan issuance, entitlement state, merchant registry state, product registry version hashes, redemption proofs, and settlement proofs.
   - Full product and nutrition data remains off-chain.

## System flow

1. A plan purchaser creates or funds a subscription package.
2. The platform issues a Victuals Pass to an eligible user.
3. The pass wallet receives scheduled entitlement credits.
4. The user requests food suggestions from the Nutritional Intelligence Engine.
5. The engine filters products by plan rules, registry status, merchant availability, and price.
6. The user generates a signed redemption QR for an approved basket.
7. The merchant scans, validates, and accepts the redemption.
8. Ledger entries debit the pass wallet and credit the merchant.
9. Settlement batches are produced for merchant payout.
10. Contract anchors record the durable proof state.

## Implementation rule

Every app, service, and contract should depend on shared domain types. No app should create its own incompatible definitions of plan, pass, product, merchant, redemption, or settlement state.
