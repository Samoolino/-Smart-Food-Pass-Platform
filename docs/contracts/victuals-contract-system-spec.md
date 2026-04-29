# VICTUALS Contract System Spec

The contract layer is a truth boundary. It should anchor durable state, references, proofs, and permissions while keeping large product, nutrition, identity, and merchant documents off-chain.

## Contract principles

- Store hashes, references, states, roles, limits, and proof events on-chain.
- Keep full nutrition data, product documents, identity documents, and merchant agreements off-chain.
- Use backend services and registry adapters for rich data processing.
- Use contracts to verify that the off-chain system follows approved plan, pass, merchant, product, and redemption states.
- Maintain a legacy compatibility boundary for the existing Smart Food Pass scaffold.

## Proposed modules

| Module | Responsibility |
| --- | --- |
| `VictualsAccessController` | Role authority for admin, operator, merchant, oracle, treasury, compliance, and upgrader roles. |
| `SubscriptionPlanRegistry` | Stores approved plan templates, funding metadata hashes, plan limits, and active status. |
| `VictualsPassManager` | Issues and updates pass state references for eligible users. |
| `EntitlementScheduler` | Anchors credit interval, validity, carryover, and schedule proof state. |
| `MerchantRegistry` | Stores merchant accreditation state and settlement profile reference hash. |
| `ProductRegistryAnchor` | Stores approved product registry version hashes and source version references. |
| `NutritionPolicyAnchor` | Stores nutritional eligibility matrix version hashes. |
| `RedemptionVerifier` | Records signed redemption intents, nonce usage, basket hash, and redemption status. |
| `SettlementAnchor` | Records merchant settlement batch proof hashes and reconciliation state. |
| `CompliancePolicy` | Stores compliance flags, restricted plan categories, and pause/suspension controls. |

## State boundaries

### On-chain

- Plan id
- Plan template hash
- Plan active state
- Pass id
- Pass lifecycle state
- Merchant id
- Merchant accreditation state
- Product registry version hash
- Nutrition matrix version hash
- Redemption id
- Redemption basket hash
- Redemption nonce state
- Settlement batch hash

### Off-chain

- Full user records
- Full identity records
- Full product nutrition records
- Full merchant agreements
- Product images and label documents
- Detailed inventory feeds
- Detailed price feeds
- Payment and settlement account details

## Event requirements

Each module should emit explicit events for auditability.

Recommended events:

- `PlanCreated`
- `PlanActivated`
- `PlanSuspended`
- `PassIssued`
- `PassStateChanged`
- `EntitlementCreditScheduled`
- `EntitlementCreditAnchored`
- `MerchantAccreditationChanged`
- `ProductRegistryVersionAnchored`
- `NutritionPolicyVersionAnchored`
- `RedemptionIntentUsed`
- `RedemptionCancelled`
- `SettlementBatchAnchored`
- `ComplianceFlagUpdated`

## Upgrade order

1. Preserve existing legacy contract code under a legacy namespace or folder.
2. Add interfaces for VICTUALS modules before concrete implementations.
3. Add shared events and custom errors.
4. Add access control and registry anchors first.
5. Add pass and entitlement lifecycle logic.
6. Add redemption verification.
7. Add settlement anchoring.
8. Add policy modules.
9. Add integration tests across plan, pass, merchant, product, redemption, and settlement flows.

## Pilot constraint

During the West Africa pilot, contracts should focus on entitlement, registry, redemption, and settlement proofs. Rich nutritional intelligence and merchant price validation should remain service-layer functions until product-market and compliance assumptions are validated.
