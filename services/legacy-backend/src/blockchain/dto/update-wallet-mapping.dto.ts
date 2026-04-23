import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateWalletMappingDto {
  @IsString()
  @MaxLength(255)
  @Matches(/^0x[a-fA-F0-9]{40}$/)
  walletAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  network?: string;
}
