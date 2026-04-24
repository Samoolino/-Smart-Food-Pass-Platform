import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_plan_registry' })
export class UserPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'sponsor_id', nullable: true })
  sponsorId?: number;

  @Column({ name: 'plan_code' })
  planCode: string;

  @Column({ name: 'plan_name' })
  planName: string;

  @Column({ nullable: true })
  tier?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress?: string;

  @Column({ name: 'access_rules', type: 'jsonb', default: {} })
  accessRules: Record<string, any>;

  @Column({ name: 'valid_from', type: 'timestamp', nullable: true })
  validFrom?: Date;

  @Column({ name: 'valid_to', type: 'timestamp', nullable: true })
  validTo?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
