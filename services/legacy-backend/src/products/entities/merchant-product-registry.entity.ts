import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'merchant_product_registry' })
export class MerchantProductRegistry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id' })
  merchantId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'inventory_qty', type: 'int', default: 0 })
  inventoryQty: number;

  @Column({ name: 'merchant_wallet_address', nullable: true })
  merchantWalletAddress?: string;

  @Column({ name: 'product_owner_wallet_address', nullable: true })
  productOwnerWalletAddress?: string;

  @Column({ name: 'payment_provider', nullable: true })
  paymentProvider?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
