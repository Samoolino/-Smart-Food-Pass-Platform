import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreatePassDto {
  @IsInt()
  beneficiaryId: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;

  @IsInt()
  @Min(1)
  @Max(365)
  validityDays: number;

  @IsOptional()
  @IsArray()
  productRestrictions?: number[];
}
