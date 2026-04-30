import type { TreasuryOperationRecord, TreasuryReservePolicy, WoAmount, WoReleaseState, WoReleaseWindow } from '@smart-food-stamp/shared-types';

export interface TreasuryReleaseInput {
  policy: TreasuryReservePolicy;
  requestedReleaseAmount: WoAmount;
  backingReferenceHash: string;
}

export interface TreasuryReleaseDecision {
  allowed: boolean;
  nextState: WoReleaseState;
  availableAfterRelease: WoAmount;
  reasonCodes: string[];
}

export interface TreasuryReleaseWorkflow {
  evaluate(input: TreasuryReleaseInput): TreasuryReleaseDecision;
  recordRelease(window: WoReleaseWindow): Promise<WoReleaseWindow>;
  recordOperation(operation: TreasuryOperationRecord): Promise<TreasuryOperationRecord>;
}
