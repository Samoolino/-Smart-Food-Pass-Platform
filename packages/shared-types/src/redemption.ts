import type { MoneyAmount } from './common';

export interface RedemptionBasketItem {
  productId: string;
  merchantId: string;
  quantity: number;
  unitPrice: MoneyAmount;
  eligibilityTags: string[];
}

export interface CombinedPassScope {
  holderRef: string;
  passIds: string[];
  planIds: string[];
  nutritionGoalTags: string[];
  passSetHash: string;
  nutritionScopeHash: string;
}

export interface RedemptionIntent {
  redemptionId: string;
  primaryPassId: string;
  combinedScope?: CombinedPassScope;
  merchantId?: string;
  basketHash: string;
  valueLimit: MoneyAmount;
  items: RedemptionBasketItem[];
  nonce: string;
  expiresAt: string;
  signature?: string;
}
