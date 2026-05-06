import type { AccreditedMerchant, MerchantAccreditationState } from '@smart-food-stamp/shared-types';

export interface AccreditationDecision {
  nextState: MerchantAccreditationState;
  reasonCodes: string[];
}

export interface MerchantAccreditationWorkflow {
  evaluate(current: AccreditedMerchant, requestedState: MerchantAccreditationState): AccreditationDecision;
}
