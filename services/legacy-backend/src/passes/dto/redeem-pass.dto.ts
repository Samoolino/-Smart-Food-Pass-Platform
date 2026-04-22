import { IsArray, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class RedeemPassDto {
  @IsOptional()
  @IsInt()
  passId?: number;

  @IsOptional()
  @IsString()
  passIdUnique?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsArray()
  productPurchased?: number[];
}
