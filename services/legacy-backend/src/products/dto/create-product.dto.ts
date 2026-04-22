import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  productName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  brand?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  nutritionJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ingredients?: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class UpdateProductDto extends CreateProductDto {}
