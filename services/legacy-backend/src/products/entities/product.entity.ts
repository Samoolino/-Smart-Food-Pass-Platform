import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'product_catalog' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  brand?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'nutrition_json', type: 'jsonb', default: {} })
  nutritionJson: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  ingredients?: string;

  @Column({ name: 'product_image_url', nullable: true })
  productImageUrl?: string;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId?: number;

  @Column({ name: 'owner_wallet_address', nullable: true })
  ownerWalletAddress?: string;

  @Column({ name: 'is_approved', default: true })
  isApproved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
