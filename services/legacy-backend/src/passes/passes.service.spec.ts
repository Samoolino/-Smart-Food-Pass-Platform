import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  BlockchainReconciliationEventType,
} from '../blockchain/entities/blockchain-reconciliation.entity';
import { PassesService } from './passes.service';
import { PassStatus } from './entities/pass.entity';
import { UserRole } from '../users/entities/user.entity';

describe('PassesService', () => {
  let service: PassesService;
  let passRepository: any;
  let passTransactionRepository: any;
  let userRepository: any;
  let sponsorRepository: any;
  let merchantRepository: any;
  let productRepository: any;
  let blockchainReconciliationRepository: any;
  let blockchainService: any;

  beforeEach(() => {
    passRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: value.id ?? 10, ...value })),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    passTransactionRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: value.id ?? 50, transactionTimestamp: new Date().toISOString(), ...value })),
      find: jest.fn(),
    };

    userRepository = { findOne: jest.fn() };
    sponsorRepository = { findOne: jest.fn() };
    merchantRepository = { findOne: jest.fn(), save: jest.fn(async (value) => value) };
    productRepository = { find: jest.fn(async () => [{ id: 1, productName: 'Rice', isApproved: true }]) };
    blockchainReconciliationRepository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => ({ id: value.id ?? 500, ...value })),
    };
    blockchainService = {
      issuePass: jest.fn(async () => ({
        txHash: '0xissue123',
        network: 'local-simulated',
        mode: 'simulated-bridge',
        sponsorWalletAddress: '0xsponsor',
        beneficiaryWalletAddress: '0xbeneficiary',
      })),
      logRedemption: jest.fn(async () => ({
        txHash: '0xabc123',
        network: 'local-simulated',
        mode: 'simulated-bridge',
        merchantWalletAddress: '0xmerchant',
      })),
    };

    service = new PassesService(
      passRepository,
      passTransactionRepository,
      userRepository,
      sponsorRepository,
      merchantRepository,
      productRepository,
      blockchainReconciliationRepository,
      blockchainService,
    );
  });

  it('creates a pass and persists issuance chain metadata plus reconciliation event', async () => {
    sponsorRepository.findOne.mockResolvedValue({ id: 7, userId: 2, walletAddress: '0xsponsor' });
    userRepository.findOne.mockResolvedValue({ id: 3, role: UserRole.BENEFICIARY, walletAddress: '0xbeneficiary' });

    const result = await service.createPass(2, {
      beneficiaryId: 3,
      value: 500,
      validityDays: 30,
      productRestrictions: [1],
    });

    expect(blockchainService.issuePass).toHaveBeenCalled();
    expect(result.issuanceBlockchainTxHash).toBe('0xissue123');
    expect(result.issuanceBlockchainMode).toBe('simulated-bridge');
    expect(blockchainReconciliationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: BlockchainReconciliationEventType.PASS_ISSUANCE,
        txHash: '0xissue123',
      }),
    );
  });

  it('throws when sponsor profile is missing on createPass', async () => {
    sponsorRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createPass(2, {
        beneficiaryId: 3,
        value: 500,
        validityDays: 30,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates a QR payload and returns eligible products', async () => {
    const checksum = 'checksum-123';
    const pass = {
      id: 10,
      passIdUnique: 'SFPASS-2026-123456',
      qrCodeHash: checksum,
      validityEnd: new Date(Date.now() + 86400000).toISOString(),
      status: PassStatus.ACTIVE,
      productRestrictions: [],
    };
    passRepository.findOne.mockResolvedValue(pass);
    jest.spyOn(service as any, 'createChecksum').mockReturnValue(checksum);

    const result = await service.validateQr({
      qrCode: JSON.stringify({ passIdUnique: pass.passIdUnique, checksum }),
    });

    expect(result.valid).toBe(true);
    expect(result.pass.id).toBe(10);
    expect(result.eligibleProducts.length).toBe(1);
  });

  it('redeems a pass and writes redemption reconciliation event with wallet-aware tx hash', async () => {
    const pass = {
      id: 10,
      passIdUnique: 'SFPASS-2026-123456',
      qrCodeHash: 'checksum-123',
      balance: 500,
      validityEnd: new Date(Date.now() + 86400000).toISOString(),
      status: PassStatus.ACTIVE,
      productRestrictions: [1],
    };
    const merchant = {
      id: 4,
      userId: 9,
      isApproved: true,
      isActive: true,
      totalRedeemed: 0,
      walletAddress: '0xmerchant',
    };

    merchantRepository.findOne.mockResolvedValue(merchant);
    passRepository.findOne.mockResolvedValue(pass);
    jest.spyOn(service as any, 'createChecksum').mockReturnValue('checksum-123');

    const result = await service.redeemPass(9, {
      passId: 10,
      amount: 125,
      productPurchased: [1],
    });

    expect(blockchainService.logRedemption).toHaveBeenCalledWith(
      expect.objectContaining({ merchantWalletAddress: '0xmerchant' }),
    );
    expect(result.receipt.blockchainTxHash).toBe('0xabc123');
    expect(result.receipt.merchantWalletAddress).toBe('0xmerchant');
    expect(blockchainReconciliationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: BlockchainReconciliationEventType.PASS_REDEMPTION,
        txHash: '0xabc123',
        merchantWalletAddress: '0xmerchant',
      }),
    );
  });

  it('throws when pass lookup fails', async () => {
    merchantRepository.findOne.mockResolvedValue({ id: 4, userId: 9, isApproved: true, isActive: true, totalRedeemed: 0 });
    passRepository.findOne.mockResolvedValue(null);

    await expect(
      service.redeemPass(9, { passId: 99, amount: 20 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
