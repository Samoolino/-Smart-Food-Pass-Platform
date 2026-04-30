import type { AccountAccessState, IdentityAccreditationRef } from '@smart-food-stamp/shared-types';

export interface WalletAccessInput {
  holderRef: string;
  loginAuthenticated: boolean;
  accreditation: IdentityAccreditationRef[];
}

export interface WalletAccessDecision extends AccountAccessState {
  reasonCodes: string[];
}

export interface WalletAccessWorkflow {
  evaluate(input: WalletAccessInput): WalletAccessDecision;
}
