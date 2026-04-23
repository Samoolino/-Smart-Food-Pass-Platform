import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'sponsors' })
export class Sponsor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'organization_name', nullable: true })
  organizationName?: string;

  @Column({ name: 'organization_type', nullable: true })
  organizationType?: string;

  @Column({ name: 'registration_number', nullable: true })
  registrationNumber?: string;

  @Column({ name: 'contact_person', nullable: true })
  contactPerson?: string;

  @Column({ name: 'wallet_address', nullable: true })
  walletAddress?: string;

  @Column({ name: 'total_funded', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalFunded: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
