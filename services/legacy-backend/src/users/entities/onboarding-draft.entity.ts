import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_onboarding_drafts' })
export class OnboardingDraft {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'active_step', default: 'account' })
  activeStep: string;

  @Column({ type: 'jsonb', default: {} })
  account: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  kyc: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  finance: Record<string, any>;

  @Column({ name: 'role_variant', nullable: true })
  roleVariant?: string;

  @Column({ name: 'completion_status', default: 'draft' })
  completionStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
