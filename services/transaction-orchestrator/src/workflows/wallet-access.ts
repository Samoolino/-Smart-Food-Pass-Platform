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

export class DefaultWalletAccessWorkflow implements WalletAccessWorkflow {
  evaluate(input: WalletAccessInput): WalletAccessDecision {
    const verifiedAccreditation = input.accreditation.filter((item) => item.state === 'VERIFIED');
    const canViewAccount = input.loginAuthenticated;
    const canAccessWallet = canViewAccount && verifiedAccreditation.length > 0;
    const canGenerateRedemption = canAccessWallet;

    const reasonCodes: string[] = [];
    if (!input.loginAuthenticated) reasonCodes.push('LOGIN_REQUIRED');
    if (input.loginAuthenticated && verifiedAccreditation.length === 0) {
      reasonCodes.push('TRANSACTION_ACCREDITATION_REQUIRED');
    }

    return {
      holderRef: input.holderRef,
      loginMethods: input.loginAuthenticated ? ['EMAIL_PASSWORD'] : [],
      canViewAccount,
      canAccessWallet,
      canGenerateRedemption,
      accreditation: input.accreditation,
      reasonCodes
    };
  }
}
