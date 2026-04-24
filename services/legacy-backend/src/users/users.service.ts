import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewKycDocumentDto } from './dto/review-kyc-document.dto';
import { UpdateOnboardingDraftDto } from './dto/update-onboarding-draft.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OnboardingDraft } from './entities/onboarding-draft.entity';
import { User, UserRole } from './entities/user.entity';

const DEFAULT_ONBOARDING_BY_ROLE: Record<string, { activeStep: string; roleVariant: string; account: Record<string, any>; kyc: Record<string, any>; finance: Record<string, any> }> = {
  beneficiary: {
    activeStep: 'account',
    roleVariant: 'beneficiary',
    account: { role: 'beneficiary', security: ['2FA'] },
    kyc: { pepStatus: 'pending', consentChecked: false, reviewState: 'draft', reviewNotes: [] },
    finance: { authorizationMode: 'biometric', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected' },
  },
  merchant: {
    activeStep: 'account',
    roleVariant: 'merchant',
    account: { role: 'merchant', security: ['2FA', 'PIN'] },
    kyc: { pepStatus: 'pending', consentChecked: false, businessVerificationRequired: true, reviewState: 'draft', reviewNotes: [] },
    finance: { authorizationMode: '2fa', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected' },
  },
  sponsor: {
    activeStep: 'account',
    roleVariant: 'sponsor',
    account: { role: 'sponsor', security: ['2FA', 'PIN'] },
    kyc: { pepStatus: 'pending', consentChecked: false, businessVerificationRequired: true, reviewState: 'draft', reviewNotes: [] },
    finance: { authorizationMode: '2fa', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected' },
  },
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(OnboardingDraft)
    private readonly onboardingDraftRepository: Repository<OnboardingDraft>,
  ) {}

  async findById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async getOnboardingDraft(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    let draft = await this.onboardingDraftRepository.findOne({ where: { userId } });
    if (!draft) {
      draft = this.onboardingDraftRepository.create({ userId, ...this.getDefaultDraftForRole(user.role), completionStatus: 'draft' });
      draft = await this.onboardingDraftRepository.save(draft);
    }

    return this.decorateDraft(draft);
  }

  async updateOnboardingDraft(userId: number, dto: UpdateOnboardingDraftDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingDraft = await this.getOnboardingDraft(userId);
    const draft = await this.onboardingDraftRepository.findOne({ where: { id: existingDraft.id } });
    if (!draft) throw new NotFoundException('Onboarding draft not found');

    if (dto.activeStep !== undefined) draft.activeStep = dto.activeStep;
    if (dto.roleVariant !== undefined) draft.roleVariant = dto.roleVariant;
    if (dto.completionStatus !== undefined) draft.completionStatus = dto.completionStatus;
    if (dto.account) draft.account = { ...(draft.account || {}), ...dto.account };
    if (dto.kyc) draft.kyc = this.normalizeKycPayload({ ...(draft.kyc || {}), ...dto.kyc }, dto.roleVariant || draft.roleVariant || user.role);
    if (dto.finance) draft.finance = { ...(draft.finance || {}), ...dto.finance };

    const saved = await this.onboardingDraftRepository.save(draft);
    return this.decorateDraft(saved);
  }

  async reviewOnboardingKyc(userId: number, dto: ReviewKycDocumentDto, reviewerRole: string) {
    const existingDraft = await this.getOnboardingDraft(userId);
    const draft = await this.onboardingDraftRepository.findOne({ where: { id: existingDraft.id } });
    if (!draft) throw new NotFoundException('Onboarding draft not found');

    const metaField = dto.target === 'governmentId' ? 'governmentIdMeta' : dto.target === 'proofOfAddress' ? 'proofOfAddressMeta' : 'businessVerificationMeta';
    const fileNameField = dto.target === 'governmentId' ? 'governmentIdFileName' : dto.target === 'proofOfAddress' ? 'proofOfAddressFileName' : 'businessVerificationFileName';
    const currentMeta = draft.kyc?.[metaField];
    if (!draft.kyc?.[fileNameField]) {
      throw new NotFoundException('KYC file not found for selected target');
    }

    const reviewNotes = new Set<string>((draft.kyc?.reviewNotes as string[] | undefined) || []);
    reviewNotes.add(`${dto.target} set to ${dto.status} by ${reviewerRole}.`);
    if (dto.note) reviewNotes.add(dto.note);

    const kyc = {
      ...(draft.kyc || {}),
      [metaField]: {
        ...(currentMeta || {}),
        fileName: currentMeta?.fileName || draft.kyc[fileNameField],
        validationStatus: dto.status,
        reviewerNote: dto.note || currentMeta?.reviewerNote || `Marked ${dto.status}.`,
        reviewedAt: new Date().toISOString(),
      },
      reviewNotes: Array.from(reviewNotes),
    };

    const statuses = [kyc.governmentIdMeta?.validationStatus, kyc.proofOfAddressMeta?.validationStatus, kyc.businessVerificationMeta?.validationStatus].filter(Boolean);
    const allRelevantApproved = draft.roleVariant === 'beneficiary'
      ? kyc.governmentIdMeta?.validationStatus === 'approved' && kyc.proofOfAddressMeta?.validationStatus === 'approved'
      : kyc.governmentIdMeta?.validationStatus === 'approved' && kyc.proofOfAddressMeta?.validationStatus === 'approved' && kyc.businessVerificationMeta?.validationStatus === 'approved';

    if (allRelevantApproved) {
      kyc.reviewState = 'approved';
      draft.completionStatus = 'review_approved';
    } else if (statuses.includes('rejected')) {
      kyc.reviewState = 'rejected';
      draft.completionStatus = 'review_changes_required';
    } else if (statuses.includes('under_review')) {
      kyc.reviewState = 'under_review';
    }

    draft.kyc = kyc;
    const saved = await this.onboardingDraftRepository.save(draft);
    return this.decorateDraft(saved);
  }

  private normalizeKycPayload(kyc: Record<string, any>, roleVariant?: string) {
    const updated = { ...kyc };
    const fileDefinitions = [
      { fileNameKey: 'governmentIdFileName', metaKey: 'governmentIdMeta', label: 'Government ID' },
      { fileNameKey: 'proofOfAddressFileName', metaKey: 'proofOfAddressMeta', label: 'Proof of address' },
      { fileNameKey: 'businessVerificationFileName', metaKey: 'businessVerificationMeta', label: 'Business verification' },
    ] as const;

    const reviewNotes = new Set<string>((updated.reviewNotes as string[] | undefined) || []);
    fileDefinitions.forEach(({ fileNameKey, metaKey, label }) => {
      const fileName = updated[fileNameKey];
      const currentMeta = updated[metaKey] || {};
      if (fileName) {
        updated[metaKey] = {
          fileName,
          uploadedAt: currentMeta.uploadedAt || new Date().toISOString(),
          validationStatus: currentMeta.validationStatus || 'uploaded',
          reviewerNote: currentMeta.reviewerNote || `Awaiting validation for ${label.toLowerCase()}.`,
          size: currentMeta.size,
          type: currentMeta.type,
        };
      }
    });

    if (updated.governmentIdMeta?.validationStatus === 'uploaded' || updated.proofOfAddressMeta?.validationStatus === 'uploaded' || updated.businessVerificationMeta?.validationStatus === 'uploaded') {
      updated.reviewState = 'documents_uploaded';
      reviewNotes.add('Documents uploaded and awaiting validation review.');
    }
    if (updated.consentChecked) reviewNotes.add('Applicant acknowledged secure verification handling.');
    if (roleVariant === UserRole.MERCHANT || roleVariant === UserRole.SPONSOR || roleVariant === 'merchant' || roleVariant === 'sponsor') {
      updated.businessVerificationRequired = true;
      if (!updated.businessVerificationFileName) reviewNotes.add('Business verification is required for this role variant.');
    }
    updated.reviewNotes = Array.from(reviewNotes);
    return updated;
  }

  private decorateDraft(draft: OnboardingDraft) {
    const kyc = draft.kyc || {};
    const statuses = [kyc.governmentIdMeta?.validationStatus, kyc.proofOfAddressMeta?.validationStatus, kyc.businessVerificationMeta?.validationStatus].filter(Boolean);
    const approvedCount = statuses.filter((status) => status === 'approved').length;
    return {
      ...draft,
      reviewSummary: {
        reviewState: kyc.reviewState || 'draft',
        approvedCount,
        uploadedCount: [kyc.governmentIdFileName, kyc.proofOfAddressFileName, kyc.businessVerificationFileName].filter(Boolean).length,
        reviewNotes: kyc.reviewNotes || [],
      },
    };
  }

  private getDefaultDraftForRole(role: UserRole) {
    if (role === UserRole.MERCHANT) return DEFAULT_ONBOARDING_BY_ROLE.merchant;
    if (role === UserRole.SPONSOR) return DEFAULT_ONBOARDING_BY_ROLE.sponsor;
    return DEFAULT_ONBOARDING_BY_ROLE.beneficiary;
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
