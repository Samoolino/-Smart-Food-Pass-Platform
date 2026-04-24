import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMerchantProductRegistryDto {
  @IsNumber()
  merchantId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inventoryQty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  merchantWalletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  productOwnerWalletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentProvider?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateMerchantProductRegistryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inventoryQty?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  merchantWalletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  productOwnerWalletAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  paymentProvider?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
