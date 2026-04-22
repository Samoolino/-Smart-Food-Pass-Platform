import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let jwtService: any;

  beforeEach(() => {
    usersRepository = {
      findOne: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: 1, ...value })),
    };

    jwtService = {
      signAsync: jest.fn(async (payload) => `token-${payload.sub ?? payload.email}`),
      verifyAsync: jest.fn(async () => ({ sub: 1 })),
    } as Partial<JwtService>;

    service = new AuthService(usersRepository, jwtService as JwtService);
  });

  it('creates a new user on signup and returns tokens', async () => {
    usersRepository.findOne.mockResolvedValue(null);
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    const result = await service.signup({
      email: 'Sponsor@Example.com',
      password: 'Password123',
      role: UserRole.SPONSOR,
      firstName: 'Demo',
      lastName: 'Sponsor',
    });

    expect(usersRepository.create).toHaveBeenCalled();
    expect(result.user.email).toBe('Sponsor@Example.com');
    expect(result.tokens.accessToken).toContain('token-');
    expect(result.user.passwordHash).toBeUndefined();
    hashSpy.mockRestore();
  });

  it('rejects duplicate signup emails', async () => {
    usersRepository.findOne.mockResolvedValue({ id: 99, email: 'demo@example.com' });

    await expect(
      service.signup({
        email: 'demo@example.com',
        password: 'Password123',
        role: UserRole.SPONSOR,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns sanitized user and tokens on login', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'merchant@example.com',
      passwordHash: 'hashed',
      role: UserRole.MERCHANT,
    });
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await service.login({
      email: 'merchant@example.com',
      password: 'Password123',
    });

    expect(result.user.passwordHash).toBeUndefined();
    expect(result.tokens.refreshToken).toContain('token-');
    compareSpy.mockRestore();
  });

  it('throws on invalid login credentials', async () => {
    usersRepository.findOne.mockResolvedValue(null);

    await expect(
      service.login({ email: 'missing@example.com', password: 'Password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshes tokens for a valid refresh token', async () => {
    usersRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      passwordHash: 'hashed',
      role: UserRole.BENEFICIARY,
    });

    const result = await service.refresh({ refreshToken: 'valid-refresh' });

    expect(jwtService.verifyAsync).toHaveBeenCalled();
    expect(result.tokens.accessToken).toContain('token-');
  });
});
