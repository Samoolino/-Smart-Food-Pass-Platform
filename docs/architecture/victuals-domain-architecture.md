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
   - A verified user may hold multiple active Victuals Passes under the same authenticated account.
   - Multiple passes can contribute to a combined nutritional scope where plan rules allow product-category overlap or complementary nutritional goals.

3. **Nutritional Intelligence Engine**
   - Validates products against plan rules.
   - Suggests baskets using product nutrition, proximate composition, price, availability, and user feedback.
   - Guides access without making medical claims.
   - Can evaluate a combined pass context, where more than one active pass expands or prioritizes the approved product scope.

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
   - A redemption may be single-pass or multi-pass. Multi-pass redemption must declare the participating pass IDs, total value limit, basket hash, expiry, and nonce.

7. **Settlement and Ledger**
   - Internal ledger records pass debits, merchant credits, reversals, and settlement batches.
   - Merchant payout is handled through approved payment or fintech rails.

8. **Contract Truth Boundary**
   - Smart contracts anchor plan issuance, entitlement state, merchant registry state, product registry version hashes, redemption proofs, and settlement proofs.
   - Full product and nutrition data remains off-chain.

## Multi-plan and multi-pass condition

A user authenticated through the app may own more than one active Victuals Pass. Each pass keeps its own lifecycle, balance, schedule, validity, and policy scope. The Nutritional Intelligence Engine may combine active passes into a single recommendation context when the plan policies allow it.

Execution conditions:

1. Every contributing pass must be active and unexpired.
2. Every contributing pass must have available value.
3. The combined product scope must be derived from the union of allowed categories and nutrition policy tags, unless a plan is marked restrictive.
4. The redemption intent must include the selected pass IDs or a hash of the selected pass set.
5. Value capture must be allocated per pass by the wallet/redemption service before settlement is finalized.
6. No pass may be debited above its available value.
7. A restrictive plan may limit the product scope even when combined with a general plan.

## System flow

1. A plan purchaser creates or funds a subscription package.
2. The platform issues one or more Victuals Passes to an eligible user.
3. Each pass wallet receives scheduled entitlement credits.
4. The user requests food suggestions from the Nutritional Intelligence Engine.
5. The engine filters products by active pass rules, registry status, merchant availability, and price.
6. The user generates a signed redemption QR for an approved basket and selected pass scope.
7. The merchant scans, validates, and accepts the redemption.
8. Ledger entries debit the selected pass or passes and credit the merchant.
9. Settlement batches are produced for merchant payout.
10. Contract anchors record the durable proof state.

## Implementation rule

Every app, service, and contract should depend on shared domain types. No app should create its own incompatible definitions of plan, pass, product, merchant, redemption, or settlement state.
