import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let userRepository: any;
  let merchantRepository: any;
  let auditLogRepository: any;

  beforeEach(() => {
    userRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    merchantRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(async (value) => value),
    };

    auditLogRepository = {
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
    };

    service = new AdminService(userRepository, merchantRepository, auditLogRepository);
  });

  it('lists users without password hashes', async () => {
    userRepository.find.mockResolvedValue([
      { id: 1, email: 'a@example.com', passwordHash: 'secret', role: 'admin' },
    ]);

    const result = await service.listUsers();

    expect(result[0].passwordHash).toBeUndefined();
    expect(result[0].email).toBe('a@example.com');
  });

  it('approves a user and writes an audit log', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 2,
      isActive: false,
      emailVerified: false,
      passwordHash: 'secret',
    });

    const result = await service.approveUser(1, 2);

    expect(result.isActive).toBe(true);
    expect(result.emailVerified).toBe(true);
    expect(auditLogRepository.save).toHaveBeenCalled();
  });

  it('deactivates a user and writes an audit log', async () => {
    userRepository.findOne.mockResolvedValue({
      id: 3,
      isActive: true,
      passwordHash: 'secret',
    });

    const result = await service.deactivateUser(1, 3);

    expect(result.isActive).toBe(false);
    expect(auditLogRepository.save).toHaveBeenCalled();
  });

  it('approves a merchant and updates commission', async () => {
    merchantRepository.findOne
      .mockResolvedValueOnce({ id: 4, isApproved: false, commissionRate: 2 })
      .mockResolvedValueOnce({ id: 4, isApproved: true, commissionRate: 2 });

    const approved = await service.approveMerchant(1, 4);
    const updated = await service.setMerchantCommission(1, 4, 4.5);

    expect(approved.isApproved).toBe(true);
    expect(updated.commissionRate).toBe(4.5);
    expect(auditLogRepository.save).toHaveBeenCalledTimes(2);
  });

  it('throws when an unknown merchant is updated', async () => {
    merchantRepository.findOne.mockResolvedValue(null);

    await expect(service.approveMerchant(1, 99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
