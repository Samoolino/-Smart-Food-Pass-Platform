import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      emailVerified: false,
      isActive: true,
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      user: this.sanitizeUser(savedUser),
      verification: {
        status: 'pending',
        message: 'Email verification placeholder enabled for Stage 1',
      },
      tokens: await this.issueTokens(savedUser),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: this.sanitizeUser(user),
      tokens: await this.issueTokens(user),
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'change-me-too',
      });

      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        user: this.sanitizeUser(user),
        tokens: await this.issueTokens(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    return {
      ok: true,
      message: user
        ? 'Password reset placeholder issued for Stage 1'
        : 'If the account exists, a reset flow can continue',
    };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    if (!token) {
      throw new BadRequestException('Reset token is required');
    }

    return {
      ok: true,
      message: 'Password reset confirmation placeholder enabled for Stage 1',
      passwordLength: newPassword.length,
    };
  }

  async verifyEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.emailVerified = true;
    const saved = await this.usersRepository.save(user);

    return {
      ok: true,
      user: this.sanitizeUser(saved),
    };
  }

  private async issueTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'change-me',
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'change-me-too',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
