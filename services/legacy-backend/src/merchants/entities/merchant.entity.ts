import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'merchants' })
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'store_name', nullable: true })
  storeName?: string;

  @Column({ name: 'store_address', type: 'text', nullable: true })
  storeAddress?: string;

  @Column({ name: 'pos_type', nullable: true })
  posType?: string;

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress?: string;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, default: 2.0 })
  commissionRate: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'total_redeemed', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRedeemed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
