import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class BlockchainService {
  private readonly contractInfo = {
    contractName: 'SmartFoodPass',
    network: 'local-simulated',
    contractAddress: process.env.CONTRACT_ADDRESS || null,
    vaultAddress: process.env.CONTRACT_VAULT_ADDRESS || null,
    abiVersion: 'stage-3b-placeholder',
  };

  getContractInfo() {
    return this.contractInfo;
  }

  async logRedemption(input: {
    passId: number;
    merchantId: number;
    amount: number;
    transactionId: number;
  }) {
    const seed = `${input.passId}:${input.merchantId}:${input.amount}:${input.transactionId}:${Date.now()}`;
    const txHash = `0x${createHash('sha256').update(seed).digest('hex')}`;

    return {
      success: true,
      txHash,
      network: this.contractInfo.network,
      mode: 'simulated-bridge',
    };
  }

  async getTransactionStatus(txHash: string) {
    return {
      txHash,
      status: 'confirmed-local',
      network: this.contractInfo.network,
    };
  }
}
