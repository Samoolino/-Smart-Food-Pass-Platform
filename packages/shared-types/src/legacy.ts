export enum LegacyPassStatus {
  NONE = 'NONE',
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED'
}

export enum LegacyRedemptionStatus {
  NONE = 'NONE',
  RESERVED = 'RESERVED',
  CAPTURED = 'CAPTURED',
  VOIDED = 'VOIDED'
}

export interface LegacyProgramPolicyDTO {
  programId: string;
  categoryMask: bigint;
  maxPerPeriod: bigint;
  totalCap: bigint;
  validityDays: number;
  cadenceType: number;
  allowPartialRedemption: boolean;
  active: boolean;
}
