import { IsString } from 'class-validator';

export class ValidateQrDto {
  @IsString()
  qrCode: string;
}
