import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_settlements' })
export class PaymentSettlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id', nullable: true })
  merchantId?: number;

  @Column({ name: 'product_id', nullable: true })
  productId?: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @Column({ name: 'pass_id', nullable: true })
  passId?: number;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference?: string;

  @Column({ name: 'settlement_status', default: 'pending' })
  settlementStatus: string;

  @Column({ name: 'payer_wallet_address', nullable: true })
  payerWalletAddress?: string;

  @Column({ name: 'payee_wallet_address', nullable: true })
  payeeWalletAddress?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
