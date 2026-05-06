# Food Product Registry Sources

The VICTUALS Product Registry must use a multi-source adapter strategy. External data should enrich the registry, while VICTUALS owns the final product eligibility state used for transactions.

## Source strategy

| Source | Role in VICTUALS | Notes |
| --- | --- | --- |
| myfood24 | Nutrition analysis and food diary integration candidate | Commercial integration should be reviewed for API licensing, coverage, pricing, and permitted use. |
| Open Food Facts | Barcode, packaged product labels, ingredients, and nutrition facts | Useful as an open enrichment layer. Data quality should be scored because entries may be user-contributed. |
| USDA FoodData Central | Authoritative food composition and branded product nutrient data | Useful for nutrient baselines and structured food composition references. |
| FAO/INFOODS | Regional food composition baseline, especially for West Africa foods | Important for West Africa pilot foods and local recipes. |
| GS1 / Verified by GS1 | GTIN and product identity validation | Useful for packaged goods identity, brand, net content, and country-of-sale checks. |
| NAFDAC Nigeria | Nigeria registered product and food regulatory validation | Required for Nigeria pilot regulatory validation where applicable. |
| Edamam | Commercial food database and nutrition enrichment candidate | Useful for food search, UPC lookup, diet labels, and allergen labels where licensing permits. |
| Merchant inventory feed | Real price, availability, merchant SKU, and inventory validation | Required for transaction eligibility and final basket value calculation. |

## Integration principles

- External sources are never treated as final transaction truth by default.
- Every source record must be normalized into the VICTUALS Product Registry.
- Every source reference must carry source name, source product id, confidence score, and verification date.
- Merchant price and availability are required before a product can be used in a live redemption basket.
- Admin approval may be required before a product becomes eligible for restricted nutrition plans.
- Regional pilot sources should be prioritized before global generic enrichment.

## Source confidence model

Suggested confidence levels:

| Level | Meaning |
| --- | --- |
| 1 | Unverified imported record |
| 2 | External nutrition source matched |
| 3 | Barcode or GTIN matched |
| 4 | Regulatory source or official database matched |
| 5 | Merchant availability and price approved |
| 6 | Product approved for at least one Victuals plan category |

## Adapter requirement

Each adapter should provide:

- `sourceName`
- `sourceProductId`
- `fetchByName`
- `fetchByBarcode`
- `fetchByCategory`
- `normalizeProduct`
- `normalizeNutrients`
- `sourceConfidenceScore`
- `lastVerifiedAt`
- `licenseNotes`

## Initial implementation priority

1. FAO/INFOODS or regional food composition baseline
2. NAFDAC validation layer for Nigeria pilot
3. Merchant inventory and price feed
4. Open Food Facts barcode enrichment
5. myfood24 or Edamam commercial nutrition enrichment
6. GS1 identity verification where accessible
7. USDA FoodData Central for broader nutrient references
