# $WO Token and Transaction State Architecture

This document defines the VICTUALS in-app transaction state for $WO.

## Core idea

`$WO` is the internal VICTUALS value unit used for pass, plan, wallet, QR, merchant redemption, and settlement accounting.

The app may display local fiat equivalents, but transaction approval inside the VICTUALS system should use `$WO` as the canonical in-app unit.

## Account and authentication state

Users can access the app with basic account authentication:

- email
- password or secure passwordless equivalent
- session token

Transaction utility requires an additional accreditation state:

- verified identity reference
- BVN/NIN-backed accreditation reference where available and legally permitted
- consent record
- transaction access status

The application must not casually store raw BVN/NIN values. It should store verification references, provider transaction references, consent proof hashes, and accreditation state.

## Transaction access states

| State | Meaning |
| --- | --- |
| `ACCOUNT_CREATED` | User can access basic app pages. |
| `EMAIL_VERIFIED` | User has verified contact access. |
| `IDENTITY_SUBMITTED` | User submitted identity accreditation request. |
| `IDENTITY_VERIFIED` | User can access wallet and transaction utility. |
| `TRANSACTION_ENABLED` | User can generate redemption intents and use pass value. |
| `TRANSACTION_RESTRICTED` | User can view account but cannot transact. |
| `SUSPENDED` | User transaction utility is disabled. |

## $WO wallet state

A user wallet may contain multiple pass balances and combined redemption scopes.

A merchant wallet receives `$WO` after successful redemption capture.

A subscriber/funder account acquires subscription packages through fiat, stablecoin, or approved asset route. The acquired value is represented as `$WO` package value in the VICTUALS system.

## Subscriber package acquisition

1. Subscriber selects a package.
2. Package price is presented in local currency and reference currency where needed.
3. Payment or asset acquisition is completed through approved rails.
4. The system mints or allocates `$WO` package value under treasury limits.
5. The subscription package issues one or more Victuals Passes.
6. Pass wallets receive scheduled `$WO` entitlement credits.

## Merchant transaction flow

1. User selects approved products.
2. Nutritional Intelligence Engine evaluates active passes and plan goals.
3. System calculates combined product eligibility.
4. System generates:
   - basket hash
   - pass set hash
   - nutrition scope hash
   - QR redemption intent
5. Merchant validates QR.
6. Merchant accepts transaction in `$WO`.
7. User pass value is reserved and captured.
8. Merchant wallet is credited in `$WO`.
9. Merchant requests conversion to fiat or approved asset route.
10. Settlement service creates settlement batch proof.

## Merchant conversion state

| State | Meaning |
| --- | --- |
| `WO_CREDITED` | Merchant received `$WO` from redemption. |
| `CONVERSION_REQUESTED` | Merchant requested conversion. |
| `CONVERSION_REVIEWED` | Conversion request passed review. |
| `SETTLEMENT_BATCHED` | Request is included in settlement batch. |
| `SETTLED` | Merchant payout completed. |
| `FAILED` | Conversion or settlement failed and needs review. |

## Treasury-controlled supply state

`$WO` availability should be controlled by treasury policy.

The treasury policy should define:

- lower reserve limit
- circulating `$WO` cap
- package issuance limit
- pass issuance limit
- available package value
- paused or restricted state
- audit hash for treasury policy version

Any arbitrage or yield activity must be handled as a controlled treasury operation with admin limits, review, and audit records. The user redemption pool should remain protected by reserve rules.

## Admin operating state

Admin console should expose:

- funding inflow records
- treasury policy limits
- available `$WO` issuance capacity
- active package capacity
- circulating `$WO`
- merchant settlement batches
- restricted or paused transaction state
- treasury operation audit references

## Implementation rule

`$WO` should begin as an internal accounting unit and settlement proof unit. A public token launch, bridge, or unrestricted transferable asset should require separate legal, security, and economic review.
