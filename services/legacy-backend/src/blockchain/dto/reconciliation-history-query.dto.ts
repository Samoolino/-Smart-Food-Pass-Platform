import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReconciliationHistoryQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsIn(['pass_issuance', 'pass_redemption'])
  eventType?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  passId?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  transactionId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  mode?: string;
}
