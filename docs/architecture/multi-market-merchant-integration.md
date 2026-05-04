# Multi-Market Merchant Integration Architecture

VICTUALS will support multiple market spaces where users can choose from accredited merchant stores, e-commerce APIs, inventory uploads, or registry-backed merchant product feeds.

## Market-space model

A market space is a selectable commerce environment connected to the VICTUALS Product Registry and Merchant Registry.

Examples:

- Supermarket API integration
- E-commerce store API integration
- Merchant inventory log file upload
- Merchant dashboard inventory entry
- Registry database product selection
- Regional product catalog for pilot markets

## Merchant selection flow

1. User authenticates.
2. User transaction accreditation is checked.
3. User active pass set is loaded.
4. Combined nutritional scope is calculated.
5. Market and location are selected.
6. Accredited merchant options are shown.
7. Merchant inventory is filtered by eligible products.
8. Basket is generated and priced in $WO plus local currency equivalent.
9. QR redemption intent is generated.
10. Merchant validates and confirms redemption.

## Merchant inventory source types

| Source type | Description | Use case |
| --- | --- | --- |
| `ECOMMERCE_API` | Direct store API integration. | Larger merchants with existing online store systems. |
| `INVENTORY_LOG_FILE` | CSV, JSON, or spreadsheet inventory upload. | Medium merchants without live API. |
| `MERCHANT_DASHBOARD_ENTRY` | Manual inventory and price update. | Smaller vendors and pilot merchants. |
| `REGISTRY_DB_SELECTION` | Merchant selects products from VICTUALS Product Registry. | Standardized product onboarding and price approval. |
| `REGIONAL_CATALOG` | Market-specific approved food catalog. | West Africa pilot and public relief programs. |

## Product eligibility bridge

Merchant inventory does not become transaction-eligible automatically. A product becomes eligible only when:

- product identity is matched
- nutrition profile or product class is available
- price is approved or within policy
- merchant is accredited
- product belongs to the user's combined pass scope
- basket value is within available $WO pass value

## App display requirements

The frontend should show:

- selected country and region
- available merchant store options
- merchant inventory status
- eligible product count
- unavailable or restricted products
- basket price in $WO
- local currency equivalent
- QR redemption readiness
- settlement availability for merchant

## Service dependencies

- Product Registry Service
- Merchant Accreditation Service
- Nutritional Intelligence Service
- $WO Ledger Service
- Redemption Orchestration Service
- Settlement Service
- Contract Address Registry
