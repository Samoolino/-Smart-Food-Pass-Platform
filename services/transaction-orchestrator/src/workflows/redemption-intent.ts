import type { CombinedPassScope, RedemptionBasketItem, RedemptionIntent, WoAmount } from '@smart-food-stamp/shared-types';

export interface RedemptionIntentInput {
  holderRef: string;
  combinedScope: CombinedPassScope;
  merchantId: string;
  items: RedemptionBasketItem[];
  valueLimit: WoAmount;
  expiresAt: string;
}

export interface RedemptionHashSet {
  passSetHash: string;
  nutritionScopeHash: string;
  basketHash: string;
  nonce: string;
}

export interface RedemptionIntentWorkflow {
  calculateHashes(input: RedemptionIntentInput): RedemptionHashSet;
  createSignedIntent(input: RedemptionIntentInput, hashes: RedemptionHashSet): Promise<RedemptionIntent>;
}
