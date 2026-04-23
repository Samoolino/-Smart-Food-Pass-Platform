import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Contract, JsonRpcProvider, Wallet, ZeroAddress, keccak256, toUtf8Bytes } from 'ethers';
import { Repository } from 'typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { PassTransaction } from '../passes/entities/pass-transaction.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User } from '../users/entities/user.entity';
import { UpdateWalletMappingDto } from './dto/update-wallet-mapping.dto';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import smartFoodPassArtifact from './abi/smart-food-pass.abi.json';

@Injectable()
export class BlockchainService {
  private readonly contractAddress = process.env.CONTRACT_ADDRESS || null;
  private readonly vaultAddress = process.env.CONTRACT_VAULT_ADDRESS || null;
  private readonly rpcUrl = process.env.CONTRACT_RPC_URL || process.env.RPC_URL_TESTNET || null;
  private readonly chainSignerKey = process.env.CHAIN_SIGNER_KEY || null;
  private readonly defaultMerchantAddress = process.env.DEFAULT_CHAIN_MERCHANT_ADDRESS || ZeroAddress;
  private readonly abi = (smartFoodPassArtifact as any)?.abi || [];

  private readonly provider = this.rpcUrl ? new JsonRpcProvider(this.rpcUrl) : null;
  private readonly signer = this.provider && this.chainSignerKey ? new Wallet(this.chainSignerKey, this.provider) : null;
  private readonly contract = this.provider && this.contractAddress && this.abi.length
    ? new Contract(this.contractAddress, this.abi, this.signer || this.provider)
    : null;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sponsor)
    private readonly sponsorRepository: Repository<Sponsor>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(PassTransaction)
    private readonly passTransactionRepository: Repository<PassTransaction>,
  ) {}

  getContractInfo() {
    return {
      contractName: 'SmartFoodPass',
      network: this.rpcUrl ? 'rpc-configured' : 'local-simulated',
      contractAddress: this.contractAddress,
      vaultAddress: this.vaultAddress,
      abiVersion: 'stage-8-abi-export',
      abiLoaded: this.abi.length > 0,
      rpcConfigured: Boolean(this.rpcUrl),
      signerConfigured: Boolean(this.signer),
      liveModeReady: Boolean(this.contract && this.signer),
    };
  }

  async updateUserWalletMapping(userId: number, dto: UpdateWalletMappingDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.walletAddress = dto.walletAddress.toLowerCase();
    const saved = await this.userRepository.save(user);
    const { passwordHash, ...safeUser } = saved;
    return safeUser;
  }

  async updateSponsorWalletMapping(sponsorId: number, dto: UpdateWalletMappingDto) {
    const sponsor = await this.sponsorRepository.findOne({ where: { id: sponsorId } });
    if (!sponsor) throw new NotFoundException('Sponsor not found');

    sponsor.walletAddress = dto.walletAddress.toLowerCase();
    return this.sponsorRepository.save(sponsor);
  }

  async updateMerchantWalletMapping(merchantId: number, dto: UpdateWalletMappingDto) {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    merchant.walletAddress = dto.walletAddress.toLowerCase();
    return this.merchantRepository.save(merchant);
  }

  async getWalletMappingSummary() {
    const [users, sponsors, merchants] = await Promise.all([
      this.userRepository.find(),
      this.sponsorRepository.find(),
      this.merchantRepository.find(),
    ]);

    return {
      users: {
        total: users.length,
        mapped: users.filter((item) => Boolean(item.walletAddress)).length,
        unmapped: users.filter((item) => !item.walletAddress).length,
      },
      sponsors: {
        total: sponsors.length,
        mapped: sponsors.filter((item) => Boolean(item.walletAddress)).length,
        unmapped: sponsors.filter((item) => !item.walletAddress).length,
      },
      merchants: {
        total: merchants.length,
        mapped: merchants.filter((item) => Boolean(item.walletAddress)).length,
        unmapped: merchants.filter((item) => !item.walletAddress).length,
      },
    };
  }

  async getReconciliationSummary() {
    const transactions = await this.passTransactionRepository.find();

    return {
      contract: this.getContractInfo(),
      transactions: {
        total: transactions.length,
        withBlockchainHash: transactions.filter((item) => Boolean(item.blockchainTxHash)).length,
        pendingHash: transactions.filter((item) => !item.blockchainTxHash).length,
        liveRpcReady: Boolean(this.contract && this.signer),
      },
    };
  }

  async issuePass(input: {
    passId: number;
    sponsorId: number;
    beneficiaryUserId: number;
    value: number;
    sponsorWalletAddress?: string | null;
    beneficiaryWalletAddress?: string | null;
  }) {
    const beneficiaryAddress = input.beneficiaryWalletAddress || ZeroAddress;

    if (this.contract && this.signer && beneficiaryAddress !== ZeroAddress) {
      try {
        const tx = await this.contract.issuePass(
          beneficiaryAddress,
          BigInt(Math.round(input.value)),
        );

        return {
          success: true,
          txHash: tx.hash,
          network: this.rpcUrl,
          mode: 'live-rpc',
          sponsorWalletAddress: input.sponsorWalletAddress || null,
          beneficiaryWalletAddress: beneficiaryAddress,
        };
      } catch {
        return this.simulateIssuance(input, 'rpc-fallback');
      }
    }

    return this.simulateIssuance(input, 'simulated-bridge');
  }

  async logRedemption(input: {
    passId: number;
    merchantId: number;
    amount: number;
    transactionId: number;
    merchantWalletAddress?: string;
  }) {
    if (this.contract && this.signer) {
      try {
        const merchantAddress = input.merchantWalletAddress || this.defaultMerchantAddress;
        const productHash = keccak256(toUtf8Bytes(`txn:${input.transactionId}`));
        const tx = await this.contract.logTransaction(
          BigInt(input.passId),
          merchantAddress,
          BigInt(Math.round(input.amount)),
          productHash,
        );

        return {
          success: true,
          txHash: tx.hash,
          network: this.rpcUrl,
          mode: 'live-rpc',
          merchantWalletAddress: merchantAddress,
        };
      } catch {
        return this.simulateRedemption(input, 'rpc-fallback');
      }
    }

    return this.simulateRedemption(input, 'simulated-bridge');
  }

  async getTransactionStatus(txHash: string) {
    if (this.provider) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        if (receipt) {
          return {
            txHash,
            status: receipt.status === 1 ? 'confirmed' : 'reverted',
            blockNumber: receipt.blockNumber,
            network: this.rpcUrl,
            mode: 'live-rpc',
          };
        }
      } catch {
        // fallback below
      }
    }

    return {
      txHash,
      status: 'confirmed-local',
      network: this.rpcUrl || 'local-simulated',
      mode: 'simulated-bridge',
    };
  }

  private simulateIssuance(
    input: { passId: number; sponsorId: number; beneficiaryUserId: number; value: number; sponsorWalletAddress?: string | null; beneficiaryWalletAddress?: string | null },
    mode: string,
  ) {
    const seed = `${input.passId}:${input.sponsorId}:${input.beneficiaryUserId}:${input.value}:${Date.now()}`;
    const txHash = `0x${createHash('sha256').update(seed).digest('hex')}`;

    return {
      success: true,
      txHash,
      network: this.rpcUrl || 'local-simulated',
      mode,
      sponsorWalletAddress: input.sponsorWalletAddress || null,
      beneficiaryWalletAddress: input.beneficiaryWalletAddress || null,
    };
  }

  private simulateRedemption(
    input: { passId: number; merchantId: number; amount: number; transactionId: number; merchantWalletAddress?: string },
    mode: string,
  ) {
    const seed = `${input.passId}:${input.merchantId}:${input.amount}:${input.transactionId}:${Date.now()}`;
    const txHash = `0x${createHash('sha256').update(seed).digest('hex')}`;

    return {
      success: true,
      txHash,
      network: this.rpcUrl || 'local-simulated',
      mode,
      merchantWalletAddress: input.merchantWalletAddress || null,
    };
  }
}
