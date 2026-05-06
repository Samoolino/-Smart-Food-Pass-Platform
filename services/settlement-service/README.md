# Settlement Service

The Settlement Service manages merchant settlement batches after successful internal redemptions.

## Responsibilities

- Read merchant credit ledger entries.
- Group eligible merchant credits into settlement batches.
- Produce settlement reference hashes for contract anchoring.
- Track settlement state and reconciliation notes.
- Expose settlement history to merchant and admin apps.

## Service boundary

This service coordinates settlement records and proofs. Payment rail integrations should be isolated behind provider adapters.
