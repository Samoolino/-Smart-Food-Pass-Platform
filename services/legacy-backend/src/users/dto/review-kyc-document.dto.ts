import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewKycDocumentDto {
  @IsString()
  @IsIn(['governmentId', 'proofOfAddress', 'businessVerification'])
  target: 'governmentId' | 'proofOfAddress' | 'businessVerification';

  @IsString()
  @IsIn(['approved', 'rejected', 'under_review'])
  status: 'approved' | 'rejected' | 'under_review';

  @IsOptional()
  @IsString()
  note?: string;
}
