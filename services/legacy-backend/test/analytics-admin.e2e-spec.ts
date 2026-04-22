import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AdminController } from '../src/admin/admin.controller';
import { AdminService } from '../src/admin/admin.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { AnalyticsController } from '../src/analytics/analytics.controller';
import { AnalyticsService } from '../src/analytics/analytics.service';

describe('Analytics and Admin Controllers (e2e)', () => {
  let app: INestApplication;

  const analyticsService = {
    getSponsorDashboard: jest.fn(async () => ({ passesIssued: 3, totalRedeemed: 150 })),
    getSponsorPasses: jest.fn(async () => [{ id: 1, passIdUnique: 'SFPASS-2026-123456' }]),
    getSponsorRedemptions: jest.fn(async () => [{ id: 10, amount: 100 }]),
    getSponsorBeneficiaries: jest.fn(async () => [{ id: 7, email: 'beneficiary@example.com' }]),
    getSponsorProducts: jest.fn(async () => [{ productId: 4, purchaseCount: 2 }]),
    getSystemKpis: jest.fn(async () => ({ usersCount: 10, transactionsCount: 4 })),
  };

  const adminService = {
    listUsers: jest.fn(async () => [{ id: 1, email: 'admin@example.com', role: 'admin' }]),
    approveUser: jest.fn(async () => ({ id: 2, isActive: true, emailVerified: true })),
    deactivateUser: jest.fn(async () => ({ id: 2, isActive: false })),
    listMerchants: jest.fn(async () => [{ id: 3, isApproved: false }]),
    approveMerchant: jest.fn(async () => ({ id: 3, isApproved: true })),
    setMerchantCommission: jest.fn(async () => ({ id: 3, commissionRate: 4.5 })),
    listAuditLogs: jest.fn(async () => [{ id: 1, action: 'approve', entityType: 'user', status: 'success' }]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnalyticsController, AdminController],
      providers: [
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: AdminService, useValue: adminService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      req.user = { sub: 1, role: 'admin' };
      next();
    });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/analytics/sponsor/dashboard (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/analytics/sponsor/dashboard')
      .expect(200);

    expect(response.body.passesIssued).toBe(3);
  });

  it('/api/analytics/system/kpis (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/analytics/system/kpis')
      .expect(200);

    expect(response.body.usersCount).toBe(10);
  });

  it('/api/admin/users (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/users')
      .expect(200);

    expect(response.body[0].email).toBe('admin@example.com');
  });

  it('/api/admin/users/:id/approve (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/admin/users/2/approve')
      .expect(201);

    expect(response.body.isActive).toBe(true);
  });

  it('/api/admin/merchants/:id/commission (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/admin/merchants/3/commission')
      .send({ commissionRate: 4.5 })
      .expect(200);

    expect(response.body.commissionRate).toBe(4.5);
  });

  it('/api/admin/audit-logs (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/admin/audit-logs')
      .expect(200);

    expect(response.body[0].action).toBe('approve');
  });
});
