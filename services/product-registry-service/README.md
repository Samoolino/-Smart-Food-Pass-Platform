# Product Registry Service

The Product Registry Service owns the VICTUALS-normalized product catalog.

## Responsibilities

- Import product records from approved sources.
- Normalize nutrients and proximate composition into VICTUALS shared types.
- Link products to source references.
- Maintain source confidence scores.
- Maintain product eligibility state.
- Provide product records to the Nutritional Intelligence Engine.
- Publish product registry version hashes for contract anchoring.

## Service boundary

This service provides product truth, merchant availability, price references, and eligibility state to downstream services.
