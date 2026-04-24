import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateOnboardingDraftDto {
  @IsOptional()
  @IsString()
  activeStep?: string;

  @IsOptional()
  @IsObject()
  account?: Record<string, any>;

  @IsOptional()
  @IsObject()
  kyc?: Record<string, any>;

  @IsOptional()
  @IsObject()
  finance?: Record<string, any>;

  @IsOptional()
  @IsString()
  @IsIn(['beneficiary', 'merchant', 'sponsor'])
  roleVariant?: string;

  @IsOptional()
  @IsString()
  completionStatus?: string;
}
