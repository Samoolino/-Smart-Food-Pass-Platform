# Wallet Service

The Wallet Service manages Victuals Pass balances and scheduled entitlement credits.

## Responsibilities

- Track pass wallet balances.
- Apply scheduled credits from subscription plan rules.
- Enforce carryover and expiry windows.
- Produce ledger entries for credits and debits.
- Expose balance state to redemption services.

## Service boundary

This service records internal pass value state. It does not replace regulated payment infrastructure.
