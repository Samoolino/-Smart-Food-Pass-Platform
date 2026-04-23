import { NotFoundException } from '@nestjs/common';
import {
  BlockchainReconciliationEventType,
} from './entities/blockchain-reconciliation.entity';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let userRepository: any;
  let sponsorRepository: any;
  let merchantRepository: any;
  let passRepository: any;
  let passTransactionRepository: any;
  let blockchainReconciliationRepository: any;
  let reconciliationQb: any;

  beforeEach(() => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    sponsorRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    merchantRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    passRepository = {
      find: jest.fn(),
    };

    passTransactionRepository = {
      find: jest.fn(),
    };

    reconciliationQb = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([
        [
          { id: 100, eventType: BlockchainReconciliationEventType.PASS_ISSUANCE, status: 'recorded' },
          { id: 101, eventType: BlockchainReconciliationEventType.PASS_REDEMPTION, status: 'pending' },
        ],
        2,
      ]),
    };

    blockchainReconciliationRepository = {
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      createQueryBuilder: jest.fn(() => reconciliationQb),
    };

    service = new BlockchainService(
      userRepository,
      sponsorRepository,
      merchantRepository,
      passRepository,
      passTransactionRepository,
      blockchainReconciliationRepository,
    );
  });

  it('updates user wallet mapping and strips password hash', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      passwordHash: 'secret',
      walletAddress: null,
    });

    const result = await service.updateUserWalletMapping(1, {
      walletAddress: '0xAbCdEf0000000000000000000000000000000000',
    });

    expect(result.walletAddress).toBe('0xabcdef0000000000000000000000000000000000');
    expect(result.passwordHash).toBeUndefined();
  });

  it('updates sponsor and merchant wallet mappings', async () => {
    sponsorRepository.findOne.mockResolvedValue({ id: 7, walletAddress: null });
    merchantRepository.findOne.mockResolvedValue({ id: 8, walletAddress: null });

    const sponsor = await service.updateSponsorWalletMapping(7, {
      walletAddress: '0x1111111111111111111111111111111111111111',
    });
    const merchant = await service.updateMerchantWalletMapping(8, {
      walletAddress: '0x2222222222222222222222222222222222222222',
    });

    expect(sponsor.walletAddress).toBe('0x1111111111111111111111111111111111111111');
    expect(merchant.walletAddress).toBe('0x2222222222222222222222222222222222222222');
  });

  it('throws when updating a missing wallet mapping record', async () => {
    merchantRepository.findOne.mockResolvedValue(null);

    await expect(
      service.updateMerchantWalletMapping(404, {
        walletAddress: '0x3333333333333333333333333333333333333333',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('computes wallet mapping summary counts', async () => {
    userRepository.find.mockResolvedValue([
      { id: 1, walletAddress: '0x1' },
      { id: 2, walletAddress: null },
    ]);
    sponsorRepository.find.mockResolvedValue([
      { id: 7, walletAddress: '0x2' },
    ]);
    merchantRepository.find.mockResolvedValue([
      { id: 8, walletAddress: null },
      { id: 9, walletAddress: '0x3' },
    ]);

    const result = await service.getWalletMappingSummary();

    expect(result.users).toEqual({ total: 2, mapped: 1, unmapped: 1 });
    expect(result.sponsors).toEqual({ total: 1, mapped: 1, unmapped: 0 });
    expect(result.merchants).toEqual({ total: 2, mapped: 1, unmapped: 1 });
  });

  it('computes richer reconciliation summary from passes, transactions, and events', async () => {
    passRepository.find.mockResolvedValue([
      { id: 10, issuanceBlockchainTxHash: '0xissue1' },
      { id: 11, issuanceBlockchainTxHash: null },
    ]);
    passTransactionRepository.find.mockResolvedValue([
      { id: 1, blockchainTxHash: '0xabc' },
      { id: 2, blockchainTxHash: null },
      { id: 3, blockchainTxHash: '0xdef' },
    ]);
    blockchainReconciliationRepository.find.mockResolvedValue([
      { id: 100, eventType: BlockchainReconciliationEventType.PASS_ISSUANCE, txHash: '0xissue1' },
      { id: 101, eventType: BlockchainReconciliationEventType.PASS_REDEMPTION, txHash: '0xabc' },
      { id: 102, eventType: BlockchainReconciliationEventType.PASS_REDEMPTION, txHash: '0xdef' },
    ]);

    const result = await service.getReconciliationSummary();

    expect(result.issuance.totalPasses).toBe(2);
    expect(result.issuance.withIssuanceHash).toBe(1);
    expect(result.issuance.pendingIssuanceHash).toBe(1);
    expect(result.transactions.total).toBe(3);
    expect(result.reconciliationEvents.issuanceEvents).toBe(1);
    expect(result.reconciliationEvents.redemptionEvents).toBe(2);
  });

  it('returns paginated reconciliation history with filters', async () => {
    const result = await service.getReconciliationHistory({
      page: 2,
      limit: 5,
      eventType: 'pass_redemption',
      passId: 10,
      status: 'pending',
      mode: 'simulated-bridge',
    });

    expect(blockchainReconciliationRepository.createQueryBuilder).toHaveBeenCalledWith('event');
    expect(reconciliationQb.skip).toHaveBeenCalledWith(5);
    expect(reconciliationQb.take).toHaveBeenCalledWith(5);
    expect(reconciliationQb.andWhere).toHaveBeenCalledTimes(4);
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 2, totalPages: 1 });
    expect(result.filters.eventType).toBe('pass_redemption');
    expect(result.items).toHaveLength(2);
  });

  it('creates reconciliation events explicitly', async () => {
    const result = await service.createReconciliationEvent({
      eventType: BlockchainReconciliationEventType.PASS_ISSUANCE,
      passId: 10,
      txHash: '0xissue1',
      network: 'local-simulated',
      mode: 'simulated-bridge',
      status: 'recorded',
      sponsorWalletAddress: '0xsponsor',
      beneficiaryWalletAddress: '0xbeneficiary',
      metadata: { passValue: 500 },
    });

    expect(result.eventType).toBe(BlockchainReconciliationEventType.PASS_ISSUANCE);
    expect(blockchainReconciliationRepository.save).toHaveBeenCalled();
  });

  it('falls back to simulated issuance and redemption when live rpc is not ready', async () => {
    const issuance = await service.issuePass({
      passId: 10,
      sponsorId: 7,
      beneficiaryUserId: 3,
      value: 500,
      sponsorWalletAddress: '0xsponsor',
      beneficiaryWalletAddress: '0xbeneficiary',
    });
    const redemption = await service.logRedemption({
      passId: 10,
      merchantId: 8,
      amount: 125,
      transactionId: 90,
      merchantWalletAddress: '0x4444444444444444444444444444444444444444',
    });

    expect(issuance.success).toBe(true);
    expect(issuance.txHash.startsWith('0x')).toBe(true);
    expect(redemption.success).toBe(true);
    expect(redemption.txHash.startsWith('0x')).toBe(true);
  });
});
