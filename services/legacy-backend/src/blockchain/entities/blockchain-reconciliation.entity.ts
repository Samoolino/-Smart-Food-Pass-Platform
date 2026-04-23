import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum BlockchainReconciliationEventType {
  PASS_ISSUANCE = 'pass_issuance',
  PASS_REDEMPTION = 'pass_redemption',
}

@Entity({ name: 'blockchain_reconciliation_events' })
export class BlockchainReconciliationEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pass_id', nullable: true })
  passId?: number;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: number;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: BlockchainReconciliationEventType,
  })
  eventType: BlockchainReconciliationEventType;

  @Column({ name: 'tx_hash', nullable: true })
  txHash?: string;

  @Column({ nullable: true })
  network?: string;

  @Column({ nullable: true })
  mode?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ name: 'sponsor_wallet_address', nullable: true })
  sponsorWalletAddress?: string;

  @Column({ name: 'beneficiary_wallet_address', nullable: true })
  beneficiaryWalletAddress?: string;

  @Column({ name: 'merchant_wallet_address', nullable: true })
  merchantWalletAddress?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
