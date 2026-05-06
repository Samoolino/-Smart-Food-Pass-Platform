import type { MoneyAmount } from './common';
import type { NutrientProfile, NutritionSource, ProximateComposition } from './nutrition';

export type ProductEligibilityState =
  | 'UNVERIFIED'
  | 'SOURCE_VERIFIED'
  | 'REGULATORY_VERIFIED'
  | 'NUTRITION_APPROVED'
  | 'MERCHANT_PRICE_APPROVED'
  | 'PASS_ELIGIBLE'
  | 'RESTRICTED';

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
