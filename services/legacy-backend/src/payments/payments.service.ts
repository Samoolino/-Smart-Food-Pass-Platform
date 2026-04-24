import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { MerchantProductRegistry } from '../products/entities/merchant-product-registry.entity';
import { User } from '../users/entities/user.entity';
import { CreatePaymentSettlementDto, CreateUserPlanDto } from './dto/payment-harness.dto';
import { PaymentSettlement } from './entities/payment-settlement.entity';
import { UserPlan } from './entities/user-plan.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(UserPlan)
    private readonly userPlanRepository: Repository<UserPlan>,
    @InjectRepository(PaymentSettlement)
    private readonly paymentSettlementRepository: Repository<PaymentSettlement>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MerchantProductRegistry)
    private readonly merchantProductRegistryRepository: Repository<MerchantProductRegistry>,
  ) {}

  async createUserPlan(dto: CreateUserPlanDto) {
    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const plan = this.userPlanRepository.create({
      ...dto,
      walletAddress: dto.walletAddress || user.walletAddress || null,
      status: dto.status || 'active',
      accessRules: dto.accessRules || {},
    });

    return this.userPlanRepository.save(plan);
  }

  async listUserPlans(userId?: number) {
    if (userId) {
      return this.userPlanRepository.find({ where: { userId } });
    }
    return this.userPlanRepository.find();
  }

  async createTestIntent(payload: {
    merchantId: number;
    productId: number;
    userId: number;
    passId?: number;
    amount: number;
    provider?: string;
  }) {
    const [merchant, product, user, registry] = await Promise.all([
      this.merchantRepository.findOne({ where: { id: payload.merchantId } }),
      this.productRepository.findOne({ where: { id: payload.productId } }),
      this.userRepository.findOne({ where: { id: payload.userId } }),
      this.merchantProductRegistryRepository.findOne({ where: { merchantId: payload.merchantId, productId: payload.productId } }),
    ]);

    if (!merchant) throw new NotFoundException('Merchant not found');
    if (!product) throw new NotFoundException('Product not found');
    if (!user) throw new NotFoundException('User not found');

    const provider = payload.provider || registry?.paymentProvider || 'simulated-pay';
    const providerReference = `pay_${createHash('sha1').update(`${payload.merchantId}:${payload.productId}:${payload.userId}:${Date.now()}`).digest('hex').slice(0, 16)}`;

    return {
      ok: true,
      provider,
      providerReference,
      amount: payload.amount,
      currency: 'NGN',
      payerWalletAddress: user.walletAddress || null,
      payeeWalletAddress: registry?.productOwnerWalletAddress || product.ownerWalletAddress || merchant.walletAddress || null,
      merchantWalletAddress: merchant.walletAddress || registry?.merchantWalletAddress || null,
      productOwnerWalletAddress: registry?.productOwnerWalletAddress || product.ownerWalletAddress || null,
    };
  }

  async createSettlement(dto: CreatePaymentSettlementDto) {
    const settlement = this.paymentSettlementRepository.create({
      ...dto,
      currency: dto.currency || 'NGN',
      provider: dto.provider || 'simulated-pay',
      settlementStatus: dto.settlementStatus || 'pending',
      metadata: dto.metadata || {},
    });

    return this.paymentSettlementRepository.save(settlement);
  }

  async listSettlements(query?: { merchantId?: number; userId?: number; status?: string }) {
    const qb = this.paymentSettlementRepository.createQueryBuilder('settlement');

    if (query?.merchantId) {
      qb.andWhere('settlement.merchantId = :merchantId', { merchantId: query.merchantId });
    }

    if (query?.userId) {
      qb.andWhere('settlement.userId = :userId', { userId: query.userId });
    }

    if (query?.status) {
      qb.andWhere('settlement.settlementStatus = :status', { status: query.status });
    }

    qb.orderBy('settlement.createdAt', 'DESC');
    return qb.getMany();
  }
}
