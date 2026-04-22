import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PassStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REDEEMED = 'redeemed',
  PARTIAL = 'partial',
  PENDING = 'pending',
}

@Entity({ name: 'passes' })
export class Pass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pass_id_unique', unique: true })
  passIdUnique: string;

  @Column({ name: 'qr_code_hash', nullable: true })
  qrCodeHash?: string;

  @Column({ name: 'beneficiary_id' })
  beneficiaryId: number;

  @Column({ name: 'sponsor_id' })
  sponsorId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance: number;

  @Column({ name: 'validity_start', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  validityStart: Date;

  @Column({ name: 'validity_end', type: 'timestamp' })
  validityEnd: Date;

  @Column({
    type: 'enum',
    enum: PassStatus,
    default: PassStatus.ACTIVE,
  })
  status: PassStatus;

  @Column({ name: 'product_restrictions', type: 'jsonb', default: [] })
  productRestrictions: number[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
