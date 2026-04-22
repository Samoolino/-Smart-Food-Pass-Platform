import { AnalyticsService } from './analytics.service';
import { PassStatus } from '../passes/entities/pass.entity';
import { UserRole } from '../users/entities/user.entity';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let passRepository: any;
  let passTransactionRepository: any;
  let sponsorRepository: any;
  let userRepository: any;

  beforeEach(() => {
    passRepository = {
      find: jest.fn(),
    };

    passTransactionRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { id: 1, amount: 100, productPurchased: [4, 4, 5] },
          { id: 2, amount: 50, productPurchased: [5] },
        ]),
      })),
    };

    sponsorRepository = {
      findOne: jest.fn(),
    };

    userRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 3, role: UserRole.BENEFICIARY }]),
      })),
    };

    service = new AnalyticsService(
      passRepository,
      passTransactionRepository,
      sponsorRepository,
      userRepository,
    );
  });

  it('returns zeroed sponsor dashboard when sponsor profile is missing', async () => {
    sponsorRepository.findOne.mockResolvedValue(null);

    const result = await service.getSponsorDashboard(99);

    expect(result.passesIssued).toBe(0);
    expect(result.totalRedeemed).toBe(0);
  });

  it('computes sponsor dashboard metrics from passes and transactions', async () => {
    sponsorRepository.findOne.mockResolvedValue({ id: 7, userId: 1 });
    passRepository.find.mockResolvedValue([
      { id: 10, sponsorId: 7, beneficiaryId: 3, status: PassStatus.ACTIVE, value: 500, balance: 250 },
      { id: 11, sponsorId: 7, beneficiaryId: 4, status: PassStatus.REDEEMED, value: 300, balance: 0 },
      { id: 12, sponsorId: 7, beneficiaryId: 4, status: PassStatus.PARTIAL, value: 200, balance: 75 },
    ]);

    const result = await service.getSponsorDashboard(1);

    expect(result.passesIssued).toBe(3);
    expect(result.activePasses).toBe(1);
    expect(result.redeemedPasses).toBe(1);
    expect(result.partialPasses).toBe(1);
    expect(result.totalValue).toBe(1000);
    expect(result.totalRedeemed).toBe(150);
    expect(result.beneficiariesCount).toBe(2);
  });

  it('aggregates sponsor product usage counts', async () => {
    sponsorRepository.findOne.mockResolvedValue({ id: 7, userId: 1 });

    const result = await service.getSponsorProducts(1);

    expect(result[0]).toEqual({ productId: 4, purchaseCount: 2 });
    expect(result[1]).toEqual({ productId: 5, purchaseCount: 2 });
  });

  it('computes system kpis across users, passes, and transactions', async () => {
    userRepository.find.mockResolvedValue([
      { id: 1, role: UserRole.SPONSOR },
      { id: 2, role: UserRole.MERCHANT },
      { id: 3, role: UserRole.BENEFICIARY },
    ]);
    passRepository.find.mockResolvedValue([
      { id: 10, status: PassStatus.ACTIVE },
      { id: 11, status: PassStatus.REDEEMED },
    ]);
    passTransactionRepository.find.mockResolvedValue([
      { id: 1, amount: 100 },
      { id: 2, amount: 40 },
    ]);

    const result = await service.getSystemKpis();

    expect(result.usersCount).toBe(3);
    expect(result.activePasses).toBe(1);
    expect(result.redeemedValue).toBe(140);
    expect(result.transactionsCount).toBe(2);
  });
});
