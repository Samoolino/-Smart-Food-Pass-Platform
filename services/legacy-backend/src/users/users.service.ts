import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateOnboardingDraftDto } from './dto/update-onboarding-draft.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { OnboardingDraft } from './entities/onboarding-draft.entity';
import { User, UserRole } from './entities/user.entity';

const DEFAULT_ONBOARDING_BY_ROLE: Record<string, { activeStep: string; roleVariant: string; account: Record<string, any>; kyc: Record<string, any>; finance: Record<string, any> }> = {
  beneficiary: {
    activeStep: 'account',
    roleVariant: 'beneficiary',
    account: { role: 'beneficiary', security: ['2FA'] },
    kyc: { pepStatus: 'pending', consentChecked: false },
    finance: { authorizationMode: 'biometric', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected' },
  },
  merchant: {
    activeStep: 'account',
    roleVariant: 'merchant',
    account: { role: 'merchant', security: ['2FA', 'PIN'] },
    kyc: { pepStatus: 'pending', consentChecked: false, businessVerificationRequired: true },
    finance: { authorizationMode: '2fa', bankConnectionStatus: 'not_connected', cardConnectionStatus: 'not_connected' },
  },
  sponsor: {
    activeStep: 'account',
    roleVariant: 'sponsor',
    account: { role: 'sponsor', security: ['2FA', 'PIN'] },
    kyc: { pepStatus: 'pending', consentChecked: false, businessVerificationRequired: true },
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, dto);
    const saved = await this.usersRepository.save(user);

    return this.sanitizeUser(saved);
  }

  async getOnboardingDraft(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let draft = await this.onboardingDraftRepository.findOne({ where: { userId } });
    if (!draft) {
      draft = this.onboardingDraftRepository.create({
        userId,
        ...this.getDefaultDraftForRole(user.role),
        completionStatus: 'draft',
      });
      draft = await this.onboardingDraftRepository.save(draft);
    }

    return draft;
  }

  async updateOnboardingDraft(userId: number, dto: UpdateOnboardingDraftDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingDraft = await this.getOnboardingDraft(userId);
    const draft = await this.onboardingDraftRepository.findOne({ where: { id: existingDraft.id } });

    if (!draft) {
      throw new NotFoundException('Onboarding draft not found');
    }

    if (dto.activeStep !== undefined) draft.activeStep = dto.activeStep;
    if (dto.roleVariant !== undefined) draft.roleVariant = dto.roleVariant;
    if (dto.completionStatus !== undefined) draft.completionStatus = dto.completionStatus;
    if (dto.account) draft.account = { ...(draft.account || {}), ...dto.account };
    if (dto.kyc) draft.kyc = { ...(draft.kyc || {}), ...dto.kyc };
    if (dto.finance) draft.finance = { ...(draft.finance || {}), ...dto.finance };

    return this.onboardingDraftRepository.save(draft);
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
