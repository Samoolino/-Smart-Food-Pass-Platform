import type { CurrencyCode, MoneyAmount } from './common';

export type InAppCurrencyCode = 'WO';

export type ExternalAssetType = 'FIAT' | 'STABLECOIN' | 'CRYPTO_ASSET' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';

export type WOTransactionState =
  | 'PLANNED'
  | 'PENDING_ACCREDITATION'
  | 'PENDING_FUNDING'
  | 'FUNDED'
  | 'WO_MINTABLE'
  | 'PASS_CREDITED'
  | 'QR_RESERVED'
  | 'MERCHANT_CAPTURED'
  | 'MERCHANT_CREDITED'
  | 'SETTLEMENT_REQUESTED'
  | 'CONVERSION_PENDING'
  | 'CONVERTED'
  | 'SETTLED'
  | 'FAILED'
  | 'REVERSED'
  | 'EXPIRED';

export type MerchantConversionState =
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface WOAmount {
  amount: number;
  unit: InAppCurrencyCode;
}

export interface LocalizedValueQuote {
  woValue: WOAmount;
  localValue: MoneyAmount;
  referenceValue?: MoneyAmount;
  rateRef?: string;
  quotedAt: string;
}

export interface PackageAcquisitionTransaction {
  transactionId: string;
  purchaserId: string;
  planId: string;
  packageValue: MoneyAmount;
  inflowAssetType: ExternalAssetType;
  inflowReference?: string;
  woValue: WOAmount;
  state: WOTransactionState;
  createdAt: string;
  updatedAt: string;
}

export interface WOTransaction {
  transactionId: string;
  state: WOTransactionState;
  holderRef?: string;
  merchantId?: string;
  planId?: string;
  passId?: string;
  redemptionId?: string;
  settlementBatchId?: string;
  woValue: WOAmount;
  localValue?: MoneyAmount;
  createdAt: string;
  updatedAt: string;
  referenceHash?: string;
  reasonCodes: string[];
}

export interface MerchantConversionRequest {
  conversionId: string;
  merchantId: string;
  requestedWO: WOAmount;
  targetAssetType: ExternalAssetType;
  targetCurrency?: CurrencyCode;
  targetAsset?: string;
  targetValueEstimate?: MoneyAmount;
  settlementAccountRef?: string;
  state: MerchantConversionState;
  createdAt: string;
  updatedAt: string;
}
