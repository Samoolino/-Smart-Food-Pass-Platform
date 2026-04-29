export type CurrencyCode = 'USD' | 'NGN' | 'GHS' | 'XOF' | 'EUR' | 'GBP';

export type PassLifecycleState =
  | 'CREATED'
  | 'FUNDED'
  | 'ACTIVE'
  | 'CREDIT_SCHEDULED'
  | 'CREDITED'
  | 'PARTIALLY_REDEEMED'
  | 'REDEEMED'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CLOSED';

export type PlanCategory =
  | 'GENERAL_NUTRITIONAL_ACCESS'
  | 'FAMILY_NUTRITION'
  | 'MATERNAL_NUTRITION'
  | 'INFANT_SUPPORT'
  | 'EMERGENCY_RELIEF'
  | 'CSR_WELFARE'
  | 'SCHOOL_FEEDING'
  | 'MEDICAL_DIET_SUPPORT';

export type MerchantAccreditationState =
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'AGREEMENT_PENDING'
  | 'ACCREDITED'
  | 'SUSPENDED'
  | 'REVOKED';

export type ProductEligibilityState =
  | 'UNVERIFIED'
  | 'SOURCE_VERIFIED'
  | 'REGULATORY_VERIFIED'
  | 'NUTRITION_APPROVED'
  | 'MERCHANT_PRICE_APPROVED'
  | 'PASS_ELIGIBLE'
  | 'RESTRICTED';

export type NutritionSource =
  | 'MYFOOD24'
  | 'OPEN_FOOD_FACTS'
  | 'USDA_FDC'
  | 'FAO_INFOODS'
  | 'GS1'
  | 'NAFDAC'
  | 'EDAMAM'
  | 'MERCHANT'
  | 'ADMIN_REVIEW';

export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  category: PlanCategory;
  purchaserId: string;
  fundingValue: MoneyAmount;
  creditAmount: MoneyAmount;
  creditIntervalDays: number;
  validityDays: number;
  carryoverDays: number;
  maxIssuablePasses?: number;
  startsAt: string;
  endsAt?: string;
  active: boolean;
}

export interface VictualsPass {
  passId: string;
  planId: string;
  holderRef: string;
  lifecycleState: PassLifecycleState;
  balance: MoneyAmount;
  lastCreditedAt?: string;
  nextCreditAt?: string;
  expiresAt?: string;
  suspendedReason?: string;
}

export interface NutrientProfile {
  energyKcal?: number;
  proteinG?: number;
  carbohydrateG?: number;
  fatG?: number;
  fiberG?: number;
  sodiumMg?: number;
  ironMg?: number;
  calciumMg?: number;
  folateUg?: number;
  vitaminAMcg?: number;
}

export interface ProximateComposition {
  moisture?: number;
  ash?: number;
  crudeProtein?: number;
  crudeFat?: number;
  crudeFiber?: number;
  carbohydrate?: number;
}

export interface ProductSourceReference {
  source: NutritionSource;
  sourceProductId?: string;
  confidenceScore: number;
  lastVerifiedAt: string;
  licenseNotes?: string;
}

export interface MerchantAvailability {
  merchantId: string;
  merchantSku?: string;
  price: MoneyAmount;
  inStock: boolean;
  lastPriceApprovedAt?: string;
}

export interface VictualsProduct {
  productId: string;
  gtin?: string;
  regulatoryRegistrationNumber?: string;
  brandName?: string;
  productName: string;
  category: string;
  nutrientProfile: NutrientProfile;
  proximateComposition?: ProximateComposition;
  eligibilityState: ProductEligibilityState;
  eligibilityTags: string[];
  restrictedTags: string[];
  sourceReferences: ProductSourceReference[];
  merchantAvailability: MerchantAvailability[];
}

export interface AccreditedMerchant {
  merchantId: string;
  legalName: string;
  tradingName?: string;
  accreditationState: MerchantAccreditationState;
  settlementAccountRef?: string;
  agreementRef?: string;
  approvedProductCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RedemptionBasketItem {
  productId: string;
  merchantId: string;
  quantity: number;
  unitPrice: MoneyAmount;
  eligibilityTags: string[];
}

export interface RedemptionIntent {
  redemptionId: string;
  passId: string;
  merchantId?: string;
  basketHash: string;
  valueLimit: MoneyAmount;
  items: RedemptionBasketItem[];
  nonce: string;
  expiresAt: string;
  signature?: string;
}

export interface LedgerEntry {
  ledgerEntryId: string;
  passId?: string;
  merchantId?: string;
  redemptionId?: string;
  entryType: 'PASS_CREDIT' | 'PASS_DEBIT' | 'MERCHANT_CREDIT' | 'REVERSAL' | 'SETTLEMENT';
  amount: MoneyAmount;
  createdAt: string;
  referenceHash?: string;
}
