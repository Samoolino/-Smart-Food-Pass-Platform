import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async listUsers() {
    const users = await this.userRepository.find({ order: { createdAt: 'DESC' } });
    return users.map(({ passwordHash, ...safeUser }) => safeUser);
  }

  async approveUser(actorUserId: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldValue = { isActive: user.isActive, emailVerified: user.emailVerified };
    user.isActive = true;
    user.emailVerified = true;
    const saved = await this.userRepository.save(user);

    await this.log(actorUserId, 'approve', 'user', user.id, oldValue, {
      isActive: saved.isActive,
      emailVerified: saved.emailVerified,
    });

    const { passwordHash, ...safeUser } = saved;
    return safeUser;
  }

  async deactivateUser(actorUserId: number, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const oldValue = { isActive: user.isActive };
    user.isActive = false;
    const saved = await this.userRepository.save(user);

    await this.log(actorUserId, 'deactivate', 'user', user.id, oldValue, {
      isActive: saved.isActive,
    });

    const { passwordHash, ...safeUser } = saved;
    return safeUser;
  }

  async listMerchants() {
    return this.merchantRepository.find({ order: { createdAt: 'DESC' } });
  }

  async approveMerchant(actorUserId: number, merchantId: number) {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const oldValue = { isApproved: merchant.isApproved };
    merchant.isApproved = true;
    const saved = await this.merchantRepository.save(merchant);

    await this.log(actorUserId, 'approve', 'merchant', merchant.id, oldValue, {
      isApproved: saved.isApproved,
    });

    return saved;
  }

  async setMerchantCommission(actorUserId: number, merchantId: number, commissionRate: number) {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const oldValue = { commissionRate: merchant.commissionRate };
    merchant.commissionRate = commissionRate;
    const saved = await this.merchantRepository.save(merchant);

    await this.log(actorUserId, 'update', 'merchant', merchant.id, oldValue, {
      commissionRate: saved.commissionRate,
    });

    return saved;
  }

  async listAuditLogs() {
    return this.auditLogRepository.find({ order: { createdAt: 'DESC' }, take: 100 });
  }

  private async log(
    actorUserId: number,
    action: string,
    entityType: string,
    entityId: number,
    oldValue?: Record<string, unknown>,
    newValue?: Record<string, unknown>,
  ) {
    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        userId: actorUserId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
        status: 'success',
      }),
    );
  }
}
