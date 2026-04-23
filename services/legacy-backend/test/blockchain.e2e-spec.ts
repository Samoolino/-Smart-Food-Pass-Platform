import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { BlockchainController } from '../src/blockchain/blockchain.controller';
import { BlockchainService } from '../src/blockchain/blockchain.service';

describe('BlockchainController (e2e)', () => {
  let app: INestApplication;

  const blockchainService = {
    getContractInfo: jest.fn(() => ({ contractName: 'SmartFoodPass', liveModeReady: false })),
    getTransactionStatus: jest.fn(async (txHash: string) => ({ txHash, status: 'confirmed-local' })),
    getWalletMappingSummary: jest.fn(async () => ({
      users: { total: 2, mapped: 1, unmapped: 1 },
      sponsors: { total: 1, mapped: 1, unmapped: 0 },
      merchants: { total: 1, mapped: 0, unmapped: 1 },
    })),
    getReconciliationSummary: jest.fn(async () => ({
      contract: { contractName: 'SmartFoodPass' },
      transactions: { total: 2, withBlockchainHash: 1, pendingHash: 1, liveRpcReady: false },
    })),
    getReconciliationHistory: jest.fn(async () => ({
      items: [{ id: 100, eventType: 'pass_redemption', status: 'pending' }],
      pagination: { page: 2, limit: 5, total: 1, totalPages: 1 },
      filters: { eventType: 'pass_redemption', passId: 10, transactionId: null, status: 'pending', txHash: null, mode: 'simulated-bridge' },
    })),
    updateUserWalletMapping: jest.fn(async (id: number, dto: any) => ({ id, email: 'user@example.com', walletAddress: dto.walletAddress })),
    updateSponsorWalletMapping: jest.fn(async (id: number, dto: any) => ({ id, walletAddress: dto.walletAddress })),
    updateMerchantWalletMapping: jest.fn(async (id: number, dto: any) => ({ id, walletAddress: dto.walletAddress })),
    logRedemption: jest.fn(async (payload: any) => ({ success: true, txHash: '0xabc', mode: 'simulated-bridge', ...payload })),
    issuePass: jest.fn(async (payload: any) => ({ success: true, txHash: '0xissue', mode: 'simulated-bridge', ...payload })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [BlockchainController],
      providers: [
        { provide: BlockchainService, useValue: blockchainService },
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

  it('/api/blockchain/mappings/summary (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/blockchain/mappings/summary')
      .expect(200);

    expect(response.body.users.total).toBe(2);
  });

  it('/api/blockchain/reconciliation/summary (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/blockchain/reconciliation/summary')
      .expect(200);

    expect(response.body.transactions.pendingHash).toBe(1);
  });

  it('/api/blockchain/reconciliation/history (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/blockchain/reconciliation/history?page=2&limit=5&eventType=pass_redemption&passId=10&status=pending&mode=simulated-bridge')
      .expect(200);

    expect(response.body.pagination.page).toBe(2);
    expect(response.body.items[0].eventType).toBe('pass_redemption');
    expect(blockchainService.getReconciliationHistory).toHaveBeenCalled();
  });

  it('/api/blockchain/mappings/users/:id (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/blockchain/mappings/users/1')
      .send({ walletAddress: '0x1111111111111111111111111111111111111111' })
      .expect(200);

    expect(response.body.walletAddress).toBe('0x1111111111111111111111111111111111111111');
  });

  it('/api/blockchain/mappings/sponsors/:id (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/blockchain/mappings/sponsors/7')
      .send({ walletAddress: '0x2222222222222222222222222222222222222222' })
      .expect(200);

    expect(response.body.walletAddress).toBe('0x2222222222222222222222222222222222222222');
  });

  it('/api/blockchain/mappings/merchants/:id (PUT)', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/blockchain/mappings/merchants/8')
      .send({ walletAddress: '0x3333333333333333333333333333333333333333' })
      .expect(200);

    expect(response.body.walletAddress).toBe('0x3333333333333333333333333333333333333333');
  });

  it('/api/blockchain/issue-pass (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/blockchain/issue-pass')
      .send({
        passId: 10,
        sponsorId: 7,
        beneficiaryUserId: 3,
        value: 500,
        sponsorWalletAddress: '0xsponsor',
        beneficiaryWalletAddress: '0xbeneficiary',
      })
      .expect(201);

    expect(response.body.txHash).toBe('0xissue');
  });

  it('/api/blockchain/redeem-pass (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/blockchain/redeem-pass')
      .send({
        passId: 10,
        merchantId: 8,
        amount: 125,
        transactionId: 90,
        merchantWalletAddress: '0x4444444444444444444444444444444444444444',
      })
      .expect(201);

    expect(response.body.txHash).toBe('0xabc');
    expect(blockchainService.logRedemption).toHaveBeenCalled();
  });
});
