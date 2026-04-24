import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateUserPlanDto {
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  sponsorId?: number;

  @IsString()
  @MaxLength(100)
  planCode: string;

  @IsString()
  @MaxLength(255)
  planName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  walletAddress?: string;

  @IsOptional()
  accessRules?: Record<string, any>;
}

export class CreatePaymentSettlementDto {
  @IsOptional()
  @IsNumber()
  merchantId?: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  passId?: number;

  @IsOptional()
  @IsNumber()
  transactionId?: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  settlementStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  payerWalletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  payeeWalletAddress?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
