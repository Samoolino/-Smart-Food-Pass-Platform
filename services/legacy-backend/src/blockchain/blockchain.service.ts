import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Contract, JsonRpcProvider, Wallet, ZeroAddress, keccak256, toUtf8Bytes } from 'ethers';
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

  private simulateRedemption(
    input: { passId: number; merchantId: number; amount: number; transactionId: number },
    mode: string,
  ) {
    const seed = `${input.passId}:${input.merchantId}:${input.amount}:${input.transactionId}:${Date.now()}`;
    const txHash = `0x${createHash('sha256').update(seed).digest('hex')}`;

    return {
      success: true,
      txHash,
      network: this.rpcUrl || 'local-simulated',
      mode,
    };
  }
}
