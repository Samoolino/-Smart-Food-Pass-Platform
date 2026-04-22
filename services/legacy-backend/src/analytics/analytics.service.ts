import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pass, PassStatus } from '../passes/entities/pass.entity';
import { PassTransaction } from '../passes/entities/pass-transaction.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Pass)
    private readonly passRepository: Repository<Pass>,
    @InjectRepository(PassTransaction)
    private readonly passTransactionRepository: Repository<PassTransaction>,
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSponsorDashboard(actorUserId: number) {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId: actorUserId } });
    if (!sponsor) {
      return {
        passesIssued: 0,
        activePasses: 0,
        redeemedPasses: 0,
        partialPasses: 0,
        totalValue: 0,
        totalRedeemed: 0,
        beneficiariesCount: 0,
        transactionsCount: 0,
      };
    }

    const passes = await this.passRepository.find({ where: { sponsorId: sponsor.id } });
    const passIds = passes.map((pass) => pass.id);
    const transactions = passIds.length
      ? await this.passTransactionRepository
          .createQueryBuilder('tx')
          .where('tx.passId IN (:...passIds)', { passIds })
          .getMany()
      : [];

    const beneficiaryIds = [...new Set(passes.map((pass) => pass.beneficiaryId))];

    return {
      passesIssued: passes.length,
      activePasses: passes.filter((pass) => pass.status === PassStatus.ACTIVE).length,
      redeemedPasses: passes.filter((pass) => pass.status === PassStatus.REDEEMED).length,
      partialPasses: passes.filter((pass) => pass.status === PassStatus.PARTIAL).length,
      expiredPasses: passes.filter((pass) => pass.status === PassStatus.EXPIRED).length,
      totalValue: this.sumNumbers(passes.map((pass) => Number(pass.value))),
      totalRemainingBalance: this.sumNumbers(passes.map((pass) => Number(pass.balance))),
      totalRedeemed: this.sumNumbers(transactions.map((tx) => Number(tx.amount))),
      beneficiariesCount: beneficiaryIds.length,
      transactionsCount: transactions.length,
    };
  }

  async getSponsorPasses(actorUserId: number) {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId: actorUserId } });
    if (!sponsor) {
      return [];
    }
    return this.passRepository.find({ where: { sponsorId: sponsor.id } });
  }

  async getSponsorRedemptions(actorUserId: number) {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId: actorUserId } });
    if (!sponsor) {
      return [];
    }

    return this.passTransactionRepository
      .createQueryBuilder('tx')
      .innerJoin(Pass, 'pass', 'pass.id = tx.passId')
      .where('pass.sponsorId = :sponsorId', { sponsorId: sponsor.id })
      .orderBy('tx.transactionTimestamp', 'DESC')
      .getMany();
  }

  async getSponsorBeneficiaries(actorUserId: number) {
    const sponsor = await this.sponsorRepository.findOne({ where: { userId: actorUserId } });
    if (!sponsor) {
      return [];
    }

    const passes = await this.passRepository.find({ where: { sponsorId: sponsor.id } });
    const beneficiaryIds = [...new Set(passes.map((pass) => pass.beneficiaryId))];

    if (!beneficiaryIds.length) {
      return [];
    }

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...beneficiaryIds)', { beneficiaryIds })
      .andWhere('user.role = :role', { role: UserRole.BENEFICIARY })
      .getMany();
  }

  async getSponsorProducts(actorUserId: number) {
    const redemptions = await this.getSponsorRedemptions(actorUserId);
    const counts: Record<string, number> = {};

    redemptions.forEach((redemption) => {
      (redemption.productPurchased || []).forEach((productId) => {
        counts[String(productId)] = (counts[String(productId)] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([productId, count]) => ({ productId: Number(productId), purchaseCount: count }))
      .sort((a, b) => b.purchaseCount - a.purchaseCount);
  }

  async getSystemKpis() {
    const [users, passes, transactions] = await Promise.all([
      this.userRepository.find(),
      this.passRepository.find(),
      this.passTransactionRepository.find(),
    ]);

    return {
      usersCount: users.length,
      sponsorsCount: users.filter((user) => user.role === UserRole.SPONSOR).length,
      merchantsCount: users.filter((user) => user.role === UserRole.MERCHANT).length,
      beneficiariesCount: users.filter((user) => user.role === UserRole.BENEFICIARY).length,
      passesCount: passes.length,
      activePasses: passes.filter((pass) => pass.status === PassStatus.ACTIVE).length,
      redeemedValue: this.sumNumbers(transactions.map((tx) => Number(tx.amount))),
      transactionsCount: transactions.length,
    };
  }

  private sumNumbers(values: number[]) {
    return Number(values.reduce((sum, value) => sum + value, 0).toFixed(2));
  }
}
