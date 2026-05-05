import type { MerchantConversionRequest, TransactionState, WoAmount } from '@smart-food-stamp/shared-types';

export interface MerchantConversionInput {
  merchantId: string;
  availableWoBalance: WoAmount;
  requestedWoAmount: WoAmount;
  targetCurrency: string;
  settlementAccountRef?: string;
}

export interface MerchantConversionDecision {
  allowed: boolean;
  nextState: TransactionState;
  reasonCodes: string[];
}

export interface MerchantConversionWorkflow {
  evaluate(input: MerchantConversionInput): MerchantConversionDecision;
  record(request: MerchantConversionRequest): Promise<MerchantConversionRequest>;
}
