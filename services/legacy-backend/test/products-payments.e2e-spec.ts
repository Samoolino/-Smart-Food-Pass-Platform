import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';

describe('Products and Payments Controllers (e2e)', () => {
  let app: INestApplication;

  const productsService = {
    listProducts: jest.fn(async () => [{ id: 1, productName: 'Fortified Rice', category: 'grains' }]),
    getCategories: jest.fn(async () => ['grains', 'protein']),
    getEligibleProducts: jest.fn(async () => [{ id: 1, productName: 'Fortified Rice' }]),
    listMerchantRegistry: jest.fn(async () => [{ id: 10, merchantId: 2, productId: 1, price: 4500 }]),
    getUserAccessibleRegistry: jest.fn(async () => ({
      plans: [{ id: 7, planCode: 'STAMP-CORE' }],
      accessible: [{ id: 10, merchantId: 2, productId: 1 }],
      guidance: { nutritionSupplyChain: 'Guided access path.' },
    })),
    getProductById: jest.fn(async (id: number) => ({ id, productName: 'Fortified Rice' })),
    createProduct: jest.fn(async (dto: any) => ({ id: 9, ...dto })),
    createMerchantRegistry: jest.fn(async (dto: any) => ({ id: 10, ...dto })),
    updateProduct: jest.fn(async (id: number, dto: any) => ({ id, ...dto })),
    updateMerchantRegistry: jest.fn(async (id: number, dto: any) => ({ id, ...dto })),
  };

  const paymentsService = {
    createUserPlan: jest.fn(async (dto: any) => ({ id: 1, ...dto })),
    listUserPlans: jest.fn(async () => [{ id: 1, planCode: 'STAMP-CORE', planName: 'Smart Stamp Core' }]),
    createTestIntent: jest.fn(async () => ({ ok: true, providerReference: 'pay_ref_123' })),
    createSettlement: jest.fn(async (dto: any) => ({ id: 88, ...dto })),
    listSettlements: jest.fn(async () => [{ id: 88, amount: 5000, settlementStatus: 'recorded' }]),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController, PaymentsController],
      providers: [
        { provide: ProductsService, useValue: productsService },
        { provide: PaymentsService, useValue: paymentsService },
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

  it('gets merchant registry', async () => {
    const response = await request(app.getHttpServer()).get('/api/products/registry').expect(200);
    expect(response.body[0].merchantId).toBe(2);
  });

  it('gets accessible registry', async () => {
    const response = await request(app.getHttpServer()).get('/api/products/accessible/1?passId=10').expect(200);
    expect(response.body.accessible[0].productId).toBe(1);
  });

  it('creates merchant registry record', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/products/registry')
      .send({ merchantId: 2, productId: 1, price: 4500, inventoryQty: 25, paymentProvider: 'simulated-pay' })
      .expect(201);
    expect(response.body.id).toBe(10);
  });

  it('creates user plan', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/payments/plans')
      .send({ userId: 1, sponsorId: 3, planCode: 'STAMP-CORE', planName: 'Smart Stamp Core' })
      .expect(201);
    expect(response.body.planCode).toBe('STAMP-CORE');
  });

  it('creates payment intent', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/payments/test/intent')
      .send({ merchantId: 2, productId: 1, userId: 1, amount: 5000, provider: 'simulated-pay' })
      .expect(201);
    expect(response.body.providerReference).toBe('pay_ref_123');
  });

  it('creates and lists settlement traces', async () => {
    await request(app.getHttpServer())
      .post('/api/payments/test/settlements')
      .send({ merchantId: 2, productId: 1, userId: 1, amount: 5000, settlementStatus: 'recorded' })
      .expect(201);

    const listResponse = await request(app.getHttpServer())
      .get('/api/payments/test/settlements?status=recorded')
      .expect(200);

    expect(listResponse.body[0].settlementStatus).toBe('recorded');
  });
});
