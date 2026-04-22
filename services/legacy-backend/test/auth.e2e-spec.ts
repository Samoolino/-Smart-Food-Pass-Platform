import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const authService = {
    signup: jest.fn(async (dto) => ({
      user: { id: 1, email: dto.email, role: dto.role },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    })),
    login: jest.fn(async (dto) => ({
      user: { id: 1, email: dto.email, role: 'sponsor' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    })),
    refresh: jest.fn(async () => ({
      user: { id: 1, email: 'user@example.com', role: 'beneficiary' },
      tokens: { accessToken: 'new-access', refreshToken: 'new-refresh' },
    })),
    verifyEmail: jest.fn(async (email) => ({ ok: true, user: { email } })),
    requestPasswordReset: jest.fn(async () => ({ ok: true })),
    confirmPasswordReset: jest.fn(async () => ({ ok: true })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/auth/login (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'sponsor@example.com', password: 'Password123' })
      .expect(201);

    expect(response.body.tokens.accessToken).toBe('access-token');
    expect(authService.login).toHaveBeenCalled();
  });

  it('/api/auth/signup (POST) validates payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'bad-email', password: 'short', role: 'unknown' })
      .expect(400);
  });

  it('/api/auth/refresh (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'refresh-token' })
      .expect(201);

    expect(response.body.tokens.accessToken).toBe('new-access');
  });
});
