import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PassTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity({ name: 'pass_transactions' })
export class PassTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pass_id' })
  passId: number;

  @Column({ name: 'merchant_id' })
  merchantId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PassTransactionStatus,
    default: PassTransactionStatus.COMPLETED,
  })
  status: PassTransactionStatus;

  @Column({ name: 'product_purchased', type: 'jsonb', default: [] })
  productPurchased: number[];

  @Column({ name: 'blockchain_tx_hash', nullable: true })
  blockchainTxHash?: string;

  @Column({ name: 'transaction_timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionTimestamp: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
