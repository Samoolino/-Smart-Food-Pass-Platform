import { NotFoundException } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let userRepository: any;
  let sponsorRepository: any;
  let merchantRepository: any;
  let passTransactionRepository: any;

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

    passTransactionRepository = {
      find: jest.fn(),
    };

    service = new BlockchainService(
      userRepository,
      sponsorRepository,
      merchantRepository,
      passTransactionRepository,
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

  it('computes reconciliation summary from transactions', async () => {
    passTransactionRepository.find.mockResolvedValue([
      { id: 1, blockchainTxHash: '0xabc' },
      { id: 2, blockchainTxHash: null },
      { id: 3, blockchainTxHash: '0xdef' },
    ]);

    const result = await service.getReconciliationSummary();

    expect(result.transactions.total).toBe(3);
    expect(result.transactions.withBlockchainHash).toBe(2);
    expect(result.transactions.pendingHash).toBe(1);
  });

  it('falls back to simulated bridge logging when live rpc is not ready', async () => {
    const result = await service.logRedemption({
      passId: 10,
      merchantId: 8,
      amount: 125,
      transactionId: 90,
      merchantWalletAddress: '0x4444444444444444444444444444444444444444',
    });

    expect(result.success).toBe(true);
    expect(result.txHash.startsWith('0x')).toBe(true);
    expect(result.mode).toMatch(/simulated|fallback/);
  });
});
