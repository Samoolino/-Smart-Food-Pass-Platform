import type { IdentityAccreditationState, PackageAcquisitionTransaction, TransactionState, TreasuryReservePolicy, WoAmount } from '@smart-food-stamp/shared-types';

export interface PackageAcquisitionInput {
  purchaserId: string;
  planId: string;
  requestedWoValue: WoAmount;
  accreditationState: IdentityAccreditationState;
  treasuryPolicy: TreasuryReservePolicy;
}

export interface PackageAcquisitionDecision {
  allowed: boolean;
  nextState: TransactionState;
  reasonCodes: string[];
}

export interface PackageAcquisitionWorkflow {
  evaluate(input: PackageAcquisitionInput): PackageAcquisitionDecision;
  record(transaction: PackageAcquisitionTransaction): Promise<PackageAcquisitionTransaction>;
}
