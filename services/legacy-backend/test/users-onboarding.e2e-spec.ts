import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('Users onboarding draft (e2e)', () => {
  let app: INestApplication;

  const usersService = {
    findById: jest.fn(async () => ({ id: 1, email: 'ada@example.com', role: 'beneficiary' })),
    updateProfile: jest.fn(async (_id: number, dto: any) => ({ id: 1, ...dto })),
    getOnboardingDraft: jest.fn(async () => ({ id: 11, userId: 1, activeStep: 'account', roleVariant: 'beneficiary', completionStatus: 'draft', account: { role: 'beneficiary' }, kyc: {}, finance: {} })),
    updateOnboardingDraft: jest.fn(async (_id: number, dto: any) => ({ id: 11, userId: 1, ...dto })),
    reviewOnboardingKyc: jest.fn(async (_id: number, dto: any) => ({ id: 11, userId: 1, reviewSummary: { reviewState: dto.status }, kyc: { [`${dto.target}Meta`]: { validationStatus: dto.status } } })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      req.user = { sub: 1, role: 'admin' };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('gets onboarding draft', async () => {
    const response = await request(app.getHttpServer()).get('/api/users/onboarding-draft').expect(200);
    expect(response.body.roleVariant).toBe('beneficiary');
  });

  it('updates onboarding draft', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/users/onboarding-draft')
      .send({ activeStep: 'finance', roleVariant: 'sponsor', finance: { walletAddress: '0xabc123' } })
      .expect(200);

    expect(response.body.activeStep).toBe('finance');
    expect(response.body.roleVariant).toBe('sponsor');
  });

  it('reviews a kyc document as admin', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/users/1/onboarding-draft/review')
      .send({ target: 'governmentId', status: 'approved', note: 'Verified by admin.' })
      .expect(200);

    expect(response.body.reviewSummary.reviewState).toBe('approved');
    expect(usersService.reviewOnboardingKyc).toHaveBeenCalledWith(1, expect.objectContaining({ target: 'governmentId' }), 'admin');
  });
});
