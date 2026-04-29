import type { MoneyAmount } from './common';

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
