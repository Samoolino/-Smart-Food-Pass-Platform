# $WO Transaction State Architecture

VICTUALS uses `$WO` as the in-app accounting unit for package value, pass value, QR redemption worth, merchant transaction approval, and merchant conversion requests.

## Core principle

`$WO` should be treated as a controlled in-app value unit backed by approved inflows and treasury release policy. It must not be issued without a recorded backing reference, treasury capacity check, and transaction state trail.

## Account access model

| Access layer | Requirement | Result |
| --- | --- | --- |
| Basic app account | Email and password or another basic login method | User can view profile and non-transactional surfaces. |
| Wallet utility | Verified accreditation reference such as BVN/NIN or an approved alternative provider | User can access wallet state, pass value, QR generation, and transaction utility. |
| Merchant utility | Merchant accreditation and settlement profile | Merchant can accept `$WO`, view balances, and request conversion. |

Raw BVN/NIN values should not be stored in VICTUALS app models. Store only provider, state, verification reference, verification time, expiry, and reason codes.

## Package acquisition flow

1. Subscriber selects a plan/package.
2. Product targets and nutritional matrix determine package value off-chain.
3. Subscriber funds the package through fiat, stablecoin, or another approved asset route.
4. Transaction Orchestrator records the inflow reference.
5. Treasury policy checks available `$WO` capacity.
6. `$WO` equivalent is credited to the pass or package wallet state.
7. Plan, pass, and redemption contracts anchor proof state where required.

## User redemption flow

1. User logs in through the basic account path.
2. Wallet utility checks accreditation state.
3. User active passes are collected into a combined pass set.
4. Nutrition engine evaluates combined nutrition goals.
5. Product registry and merchant inventory provide basket options.
6. Redemption service calculates:
   - `passSetHash`
   - `nutritionScopeHash`
   - `basketHash`
   - `nonce`
7. Signed redemption intent is created.
8. Merchant validates and captures redemption.
9. User wallet is debited in `$WO`.
10. Merchant wallet is credited in `$WO`.

## Merchant conversion flow

1. Merchant receives `$WO` after captured redemption.
2. Merchant requests conversion to fiat or another approved asset route.
3. Settlement service checks available balance and merchant settlement profile.
4. Eligible credits are batched.
5. Settlement batch hash is anchored.
6. Provider adapter handles the actual external settlement process.
7. Merchant conversion request is marked converted or failed.

## Treasury release model

The admin side controls treasury policy and release windows:

- lower reserve limit
- maximum `$WO` supply
- currently released `$WO`
- available `$WO` capacity
- backing reference hash
- operation reference hash
- release approval state

As treasury capacity increases, new `$WO` release windows can increase available plan issuance capacity. Arbitrage or treasury operations should be recorded as operation hashes and reviewed before increasing available `$WO` capacity.

## State boundaries

### On-chain

- plan metadata hash
- pass state
- schedule state
- nutrition policy version hash
- redemption intent hash set
- settlement batch hash

### Off-chain service layer

- package acquisition transaction
- identity accreditation state
- product and nutrition calculation
- `$WO` wallet ledger
- merchant conversion request
- treasury release workflow
- provider adapters

## Implementation status

Shared types now define:

- identity accreditation state
- account access state
- `$WO` transaction state
- package acquisition transaction
- wallet transaction
- merchant conversion request
- treasury reserve policy
- `$WO` release window
- treasury operation record

Service scaffolds now define:

- package acquisition workflow
- wallet access workflow
- redemption intent workflow
- merchant conversion workflow
- treasury release workflow
