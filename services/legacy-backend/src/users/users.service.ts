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

    return this.decorateDraft(draft, user);
  }

  async getOnboardingReviewQueue() {
    const drafts = await this.onboardingDraftRepository.find({ order: { updatedAt: 'DESC' } });
    const userIds = drafts.map((draft) => draft.userId);
    const users = userIds.length ? await this.usersRepository.findByIds(userIds as any) : [];
    const userMap = new Map(users.map((user) => [user.id, user]));

    return drafts.map((draft) => {
      const user = userMap.get(draft.userId);
      const decorated = this.decorateDraft(draft, user || undefined);
      return {
        id: decorated.id,
        userId: decorated.userId,
        roleVariant: decorated.roleVariant,
        completionStatus: decorated.completionStatus,
        activeStep: decorated.activeStep,
        updatedAt: decorated.updatedAt,
        reviewSummary: decorated.reviewSummary,
        notificationSummary: decorated.notificationSummary,
        profile: user
          ? {
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              walletAddress: user.walletAddress,
            }
          : null,
      };
    });
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
    return this.decorateDraft(saved, user);
  }

  async reviewOnboardingKyc(userId: number, dto: ReviewKycDocumentDto, reviewerRole: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
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
    } as any;

    const statuses = [kyc.governmentIdMeta?.validationStatus, kyc.proofOfAddressMeta?.validationStatus, kyc.businessVerificationMeta?.validationStatus].filter(Boolean);
    const allRelevantApproved = draft.roleVariant === 'beneficiary'
      ? kyc.governmentIdMeta?.validationStatus === 'approved' && kyc.proofOfAddressMeta?.validationStatus === 'approved'
      : kyc.governmentIdMeta?.validationStatus === 'approved' && kyc.proofOfAddressMeta?.validationStatus === 'approved' && kyc.businessVerificationMeta?.validationStatus === 'approved';

    if (allRelevantApproved) {
      kyc.reviewState = 'approved';
      draft.completionStatus = 'review_approved';
      reviewNotes.add('All required onboarding documents approved.');
    } else if (statuses.includes('rejected')) {
      kyc.reviewState = 'rejected';
      draft.completionStatus = 'review_changes_required';
      reviewNotes.add('Changes required before onboarding can continue.');
    } else if (statuses.includes('under_review')) {
      kyc.reviewState = 'under_review';
      draft.completionStatus = 'review_in_progress';
      reviewNotes.add('Review is currently in progress.');
    }

    kyc.reviewNotes = Array.from(reviewNotes);
    draft.kyc = kyc;
    const saved = await this.onboardingDraftRepository.save(draft);
    return this.decorateDraft(saved, user);
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

  private decorateDraft(draft: OnboardingDraft, user?: User) {
    const kyc = draft.kyc || {};
    const statuses = [kyc.governmentIdMeta?.validationStatus, kyc.proofOfAddressMeta?.validationStatus, kyc.businessVerificationMeta?.validationStatus].filter(Boolean);
    const approvedCount = statuses.filter((status) => status === 'approved').length;
    const nextReviewTarget = this.getNextReviewTarget(draft);
    return {
      ...draft,
      notificationSummary: this.getNotificationSummary(draft, user, nextReviewTarget),
      reviewSummary: {
        reviewState: kyc.reviewState || 'draft',
        approvedCount,
        uploadedCount: [kyc.governmentIdFileName, kyc.proofOfAddressFileName, kyc.businessVerificationFileName].filter(Boolean).length,
        reviewNotes: kyc.reviewNotes || [],
        nextReviewTarget,
      },
    };
  }

  private getNextReviewTarget(draft: OnboardingDraft): 'governmentId' | 'proofOfAddress' | 'businessVerification' {
    const kyc = draft.kyc || {};
    const targets: Array<{ target: 'governmentId' | 'proofOfAddress' | 'businessVerification'; fileName?: string; status?: string; required: boolean }> = [
      { target: 'governmentId', fileName: kyc.governmentIdFileName, status: kyc.governmentIdMeta?.validationStatus, required: true },
      { target: 'proofOfAddress', fileName: kyc.proofOfAddressFileName, status: kyc.proofOfAddressMeta?.validationStatus, required: true },
      { target: 'businessVerification', fileName: kyc.businessVerificationFileName, status: kyc.businessVerificationMeta?.validationStatus, required: draft.roleVariant !== 'beneficiary' },
    ];

    const priority = targets.find((item) => item.required && !item.fileName)
      || targets.find((item) => item.required && item.status === 'rejected')
      || targets.find((item) => item.required && !item.status)
      || targets.find((item) => item.required && item.status === 'uploaded')
      || targets.find((item) => item.required && item.status === 'under_review')
      || targets.find((item) => item.required && item.status !== 'approved')
      || targets[0];

    return priority.target;
  }

  private getNotificationSummary(draft: OnboardingDraft, user: User | undefined, nextReviewTarget: 'governmentId' | 'proofOfAddress' | 'businessVerification') {
    const kyc = draft.kyc || {};
    const roleVariant = draft.roleVariant || user?.role || 'beneficiary';
    const correctionStep = nextReviewTarget === 'businessVerification' ? 'kyc' : 'kyc';
    const correctionHref = `/onboarding?step=${correctionStep}&focus=${nextReviewTarget}`;
    const reviewHref = `/onboarding/review?focus=${nextReviewTarget}`;
    const accessHref = '/onboarding?step=access';

    if (kyc.reviewState === 'approved') {
      return {
        tone: 'success',
        title: 'Onboarding review approved',
        message:
          roleVariant === 'merchant'
            ? 'Your onboarding review is approved. Continue toward registry and settlement readiness.'
            : roleVariant === 'sponsor'
              ? 'Your onboarding review is approved. Continue toward funding and governance readiness.'
              : 'Your onboarding review is approved. Continue toward pass and product access readiness.',
        actionLabel: 'Continue to access setup',
        actionHref: accessHref,
      };
    }
    if (kyc.reviewState === 'rejected') {
      return {
        tone: 'warning',
        title: 'Changes required on your onboarding draft',
        message:
          roleVariant === 'merchant'
            ? 'Update your merchant verification materials and return to review.'
            : roleVariant === 'sponsor'
              ? 'Update your sponsor verification materials and return to review.'
              : 'Update your identity documents and return to review.',
        actionLabel: 'Fix required document',
        actionHref: correctionHref,
      };
    }
    if (kyc.reviewState === 'under_review' || draft.completionStatus === 'review_in_progress') {
      return {
        tone: 'info',
        title: 'Onboarding review in progress',
        message: 'Your draft is currently under admin review. Watch the review dashboard for updates.',
        actionLabel: 'Open focused review',
        actionHref: reviewHref,
      };
    }
    return {
      tone: 'neutral',
      title: 'Onboarding draft in progress',
      message: 'Complete required details and upload the remaining materials to move forward.',
      actionLabel: 'Continue required step',
      actionHref: correctionHref,
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
