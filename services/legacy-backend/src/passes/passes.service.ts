import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomInt } from 'crypto';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePassDto } from './dto/create-pass.dto';
import { RedeemPassDto } from './dto/redeem-pass.dto';
import { ValidateQrDto } from './dto/validate-qr.dto';
import { Pass, PassStatus } from './entities/pass.entity';
import {
  PassTransaction,
  PassTransactionStatus,
} from './entities/pass-transaction.entity';

@Injectable()
export class PassesService {
  constructor(
    @InjectRepository(Pass)
    private readonly passRepository: Repository<Pass>,
    @InjectRepository(PassTransaction)
    private readonly passTransactionRepository: Repository<PassTransaction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async createPass(actorUserId: number, dto: CreatePassDto) {
    const sponsor = await this.sponsorRepository.findOne({
      where: { userId: actorUserId },
    });

    if (!sponsor) {
      throw new BadRequestException('Sponsor profile not found for current user');
    }

    const beneficiary = await this.userRepository.findOne({
      where: { id: dto.beneficiaryId },
    });

    if (!beneficiary || beneficiary.role !== UserRole.BENEFICIARY) {
      throw new BadRequestException('Beneficiary account not found');
    }

    const validityStart = new Date();
    const validityEnd = new Date(validityStart);
    validityEnd.setDate(validityEnd.getDate() + dto.validityDays);

    const passIdUnique = this.generatePassIdUnique();
    const checksum = this.createChecksum(passIdUnique);

    const pass = this.passRepository.create({
      passIdUnique,
      qrCodeHash: checksum,
      beneficiaryId: beneficiary.id,
      sponsorId: sponsor.id,
      value: dto.value,
      balance: dto.value,
      validityStart,
      validityEnd,
      status: PassStatus.ACTIVE,
      productRestrictions: dto.productRestrictions || [],
    });

    const savedPass = await this.passRepository.save(pass);

    let issuanceChain: any = null;
    try {
      issuanceChain = await this.blockchainService.issuePass({
        passId: savedPass.id,
        sponsorId: sponsor.id,
        beneficiaryUserId: beneficiary.id,
        value: Number(dto.value),
        sponsorWalletAddress: sponsor.walletAddress || null,
        beneficiaryWalletAddress: beneficiary.walletAddress || null,
      });
    } catch {
      issuanceChain = null;
    }

    return {
      ...savedPass,
      qrPayload: this.buildQrPayload(savedPass),
      issuanceChain,
    };
  }

  async listPassesForUser(actorUserId: number, role: string) {
    if (role === UserRole.BENEFICIARY) {
      return this.passRepository.find({ where: { beneficiaryId: actorUserId } });
    }

    if (role === UserRole.SPONSOR) {
      const sponsor = await this.sponsorRepository.findOne({ where: { userId: actorUserId } });
      if (!sponsor) {
        return [];
      }
      return this.passRepository.find({ where: { sponsorId: sponsor.id } });
    }

    return this.passRepository.find();
  }

  async getPassById(id: number) {
    const pass = await this.passRepository.findOne({ where: { id } });
    if (!pass) {
      throw new NotFoundException('Pass not found');
    }
    return pass;
  }

  async getPassQr(id: number) {
    const pass = await this.getPassById(id);
    const payload = this.buildQrPayload(pass);
    const qrDataUrl = await QRCode.toDataURL(payload);

    return {
      passId: pass.id,
      passIdUnique: pass.passIdUnique,
      payload,
      qrDataUrl,
    };
  }

  async validateQr(dto: ValidateQrDto) {
    const parsedPayload = this.parseQrPayload(dto.qrCode);
    const pass = await this.passRepository.findOne({
      where: { passIdUnique: parsedPayload.passIdUnique },
    });

    if (!pass) {
      throw new NotFoundException('Pass not found');
    }

    this.assertPassValid(pass, parsedPayload.checksum);

    return {
      valid: true,
      pass,
      eligibleProducts: await this.getEligibleProducts(pass),
    };
  }

  async redeemPass(actorUserId: number, dto: RedeemPassDto) {
    const merchant = await this.merchantRepository.findOne({
      where: { userId: actorUserId },
    });

    if (!merchant || !merchant.isApproved || !merchant.isActive) {
      throw new BadRequestException('Merchant is not approved for redemption');
    }

    const pass = dto.passId
      ? await this.passRepository.findOne({ where: { id: dto.passId } })
      : await this.passRepository.findOne({ where: { passIdUnique: dto.passIdUnique } });

    if (!pass) {
      throw new NotFoundException('Pass not found');
    }

    this.assertPassValid(pass, pass.qrCodeHash || '');

    if (Number(pass.balance) < Number(dto.amount)) {
      throw new BadRequestException('Insufficient pass balance');
    }

    if (dto.productPurchased?.length && pass.productRestrictions?.length) {
      const invalidProduct = dto.productPurchased.find(
        (productId) => !pass.productRestrictions.includes(productId),
      );
      if (invalidProduct) {
        throw new BadRequestException('Product is not eligible for this pass');
      }
    }

    pass.balance = Number((Number(pass.balance) - Number(dto.amount)).toFixed(2));
    pass.status = pass.balance <= 0 ? PassStatus.REDEEMED : PassStatus.PARTIAL;
    await this.passRepository.save(pass);

    merchant.totalRedeemed = Number((Number(merchant.totalRedeemed) + Number(dto.amount)).toFixed(2));
    await this.merchantRepository.save(merchant);

    let transaction = await this.passTransactionRepository.save(
      this.passTransactionRepository.create({
        passId: pass.id,
        merchantId: merchant.id,
        amount: dto.amount,
        status: PassTransactionStatus.COMPLETED,
        productPurchased: dto.productPurchased || [],
      }),
    );

    try {
      const chainResult = await this.blockchainService.logRedemption({
        passId: pass.id,
        merchantId: merchant.id,
        amount: Number(dto.amount),
        transactionId: transaction.id,
        merchantWalletAddress: merchant.walletAddress || undefined,
      });

      transaction.blockchainTxHash = chainResult.txHash;
      transaction = await this.passTransactionRepository.save(transaction);
    } catch {
      transaction.blockchainTxHash = null;
      transaction = await this.passTransactionRepository.save(transaction);
    }

    return {
      ok: true,
      receipt: {
        transactionId: transaction.id,
        passId: pass.id,
        passIdUnique: pass.passIdUnique,
        merchantId: merchant.id,
        merchantWalletAddress: merchant.walletAddress || null,
        amount: transaction.amount,
        remainingBalance: pass.balance,
        status: transaction.status,
        timestamp: transaction.transactionTimestamp,
        blockchainTxHash: transaction.blockchainTxHash,
      },
    };
  }

  async getPassTransactions(passId: number) {
    return this.passTransactionRepository.find({ where: { passId } });
  }

  async getMerchantTransactions(actorUserId: number) {
    const merchant = await this.merchantRepository.findOne({ where: { userId: actorUserId } });

    if (!merchant) {
      throw new NotFoundException('Merchant profile not found');
    }

    return this.passTransactionRepository.find({ where: { merchantId: merchant.id } });
  }

  private buildQrPayload(pass: Pass) {
    return JSON.stringify({
      passIdUnique: pass.passIdUnique,
      checksum: pass.qrCodeHash,
    });
  }

  private parseQrPayload(rawQrCode: string) {
    try {
      return JSON.parse(rawQrCode) as { passIdUnique: string; checksum: string };
    } catch {
      throw new BadRequestException('QR payload is invalid');
    }
  }

  private assertPassValid(pass: Pass, checksum: string) {
    if (pass.status === PassStatus.EXPIRED) {
      throw new BadRequestException('Pass has expired');
    }

    if (new Date(pass.validityEnd).getTime() < Date.now()) {
      throw new BadRequestException('Pass validity has ended');
    }

    const expectedChecksum = this.createChecksum(pass.passIdUnique);
    if (checksum && checksum !== expectedChecksum) {
      throw new BadRequestException('QR checksum mismatch');
    }
  }

  private createChecksum(passIdUnique: string) {
    return createHash('sha256').update(passIdUnique).digest('hex');
  }

  private generatePassIdUnique() {
    const year = new Date().getFullYear();
    const sequence = randomInt(100000, 999999);
    return `SFPASS-${year}-${sequence}`;
  }

  private async getEligibleProducts(pass: Pass) {
    if (!pass.productRestrictions?.length) {
      return this.productRepository.find({ where: { isApproved: true } });
    }

    const products = await this.productRepository.find();
    return products.filter((product) => pass.productRestrictions.includes(product.id));
  }
}
