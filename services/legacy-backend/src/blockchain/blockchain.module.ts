import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Pass } from '../passes/entities/pass.entity';
import { PassTransaction } from '../passes/entities/pass-transaction.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User } from '../users/entities/user.entity';
import { BlockchainController } from './blockchain.controller';
import { BlockchainReconciliationEvent } from './entities/blockchain-reconciliation.entity';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Sponsor, Merchant, Pass, PassTransaction, BlockchainReconciliationEvent])],
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: [BlockchainService, TypeOrmModule],
})
export class BlockchainModule {}
