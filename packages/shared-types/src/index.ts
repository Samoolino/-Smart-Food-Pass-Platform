export type Address = `0x${string}`;

export enum PassStatus {
  NONE = "NONE",
  CREATED = "CREATED",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  EXPIRED = "EXPIRED"
}

export enum RedemptionStatus {
  NONE = "NONE",
  RESERVED = "RESERVED",
  CAPTURED = "CAPTURED",
  VOIDED = "VOIDED"
}

export interface ProgramPolicyDTO {
  programId: string;
  categoryMask: bigint;
  maxPerPeriod: bigint;
  totalCap: bigint;
  validityDays: number;
  cadenceType: number;
  allowPartialRedemption: boolean;
  active: boolean;
}
