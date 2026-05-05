export type Address = `0x${string}`;

export type CurrencyCode = 'USD' | 'NGN' | 'GHS' | 'XOF' | 'EUR' | 'GBP';

export interface MoneyAmount {
  amount: number;
  currency: CurrencyCode;
}

export interface SourceReference {
  source: string;
  sourceId?: string;
  confidenceScore: number;
  lastVerifiedAt: string;
  licenseNotes?: string;
}
