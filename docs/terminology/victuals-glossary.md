# VICTUALS Glossary

This glossary controls the terminology migration from the earlier Smart Food Pass scaffold into VICTUALS.

## Product name

**VICTUALS** means Smart Nutritional Food Plan Pass. It is the global product name for a subscription-funded nutritional access system.

## Controlled terminology

| Legacy term | VICTUALS term | Execution meaning |
| --- | --- | --- |
| Sponsor | Subscription Funder / Plan Purchaser | Entity that funds a plan for self, family, welfare, CSR, emergency relief, or institution-backed beneficiaries. |
| Sponsor package | Victuals Subscription Package | A priced plan with amount, validity, recurrence, category, and target nutrition intention. |
| Food pass | Victuals Pass | User entitlement object that receives scheduled shopping value and controls redemption eligibility. |
| General pass | General Nutritional Access Pass | Flexible pass category that can be improved by user feedback and product availability. |
| Pass state of existence | Pass Lifecycle State | State machine for plan creation, funding, activation, credit, redemption, expiry, suspension, and closure. |
| Product database | Product Registry | Canonical product catalog containing product identity, category, nutrition profile, approval status, source references, and merchant availability. |
| Nutrition database | Nutrition Composition Registry | Source-normalized nutrition and proximate composition layer used by the Nutritional Intelligence Engine. |
| Nutrition matrix | Nutritional Eligibility Matrix | Rule system that maps plan type, product category, nutrient profile, user category, and merchant availability. |
| Merchant auth | Accredited Merchant Registry | Registry of approved supermarkets, vendors, dispensaries, and food merchants that can accept pass transactions. |
| QR code | Signed Redemption QR / Redemption Intent | Signed basket and value authorization validated by a merchant before redemption. |
| Wallet top-up | Scheduled Entitlement Credit | Time-based credit issued to a pass wallet according to the subscription plan. |
| Merchant payout | Merchant Settlement | Conversion of in-app merchant ledger balance into an approved settlement account. |

## Naming rules

- Use **Subscription** for priced plan packages.
- Use **Funder** for the party purchasing or financing access for others.
- Use **Plan Purchaser** when the buyer may be a family, institution, company, NGO, or individual.
- Use **Merchant** only for approved food retail or dispensing operators.
- Use **Product Registry** for VICTUALS-owned normalized product records.
- Use **External Nutrition Source** for myfood24, Open Food Facts, USDA FoodData Central, FAO/INFOODS, GS1, NAFDAC, Edamam, or similar systems.
- Use **Pass Wallet** for user-facing value and **Ledger** for backend accounting truth.

## Migration rule

No new application, contract, service, or documentation module should introduce legacy sponsor or package language unless it is explicitly describing historical state or compatibility with the legacy codebase.
