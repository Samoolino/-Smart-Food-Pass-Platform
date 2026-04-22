import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PassesController } from '../src/passes/passes.controller';
import { PassesService } from '../src/passes/passes.service';

describe('PassesController (e2e)', () => {
  let app: INestApplication;
  const passesService = {
    createPass: jest.fn(async () => ({ id: 1, passIdUnique: 'SFPASS-2026-123456' })),
    listPassesForUser: jest.fn(async () => [{ id: 1, passIdUnique: 'SFPASS-2026-123456', status: 'active' }]),
    getPassById: jest.fn(async (id) => ({ id, passIdUnique: 'SFPASS-2026-123456' })),
    getPassQr: jest.fn(async () => ({ passId: 1, payload: '{"passIdUnique":"SFPASS-2026-123456"}' })),
    getPassTransactions: jest.fn(async () => [{ id: 7, amount: 100 }]),
    validateQr: jest.fn(async () => ({ valid: true, pass: { id: 1 }, eligibleProducts: [] })),
    redeemPass: jest.fn(async () => ({ ok: true, receipt: { transactionId: 7, blockchainTxHash: '0xabc' } })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PassesController],
      providers: [
        { provide: PassesService, useValue: passesService },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      req.user = { sub: 1, role: 'sponsor' };
      next();
    });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/passes (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/api/passes').expect(200);
    expect(response.body[0].passIdUnique).toBe('SFPASS-2026-123456');
  });

  it('/api/passes (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/passes')
      .send({ beneficiaryId: 3, value: 500, validityDays: 30, productRestrictions: [1] })
      .expect(201);
    expect(response.body.passIdUnique).toBe('SFPASS-2026-123456');
  });

  it('/api/passes/validate-qr (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/passes/validate-qr')
      .send({ qrCode: '{"passIdUnique":"SFPASS-2026-123456","checksum":"hash"}' })
      .expect(201);
    expect(response.body.valid).toBe(true);
  });

  it('/api/passes/redeem (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/passes/redeem')
      .send({ passId: 1, amount: 125, productPurchased: [1] })
      .expect(201);
    expect(response.body.receipt.blockchainTxHash).toBe('0xabc');
  });
});
