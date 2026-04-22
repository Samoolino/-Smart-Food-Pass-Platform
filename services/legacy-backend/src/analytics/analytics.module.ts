import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pass } from '../passes/entities/pass.entity';
import { PassTransaction } from '../passes/entities/pass-transaction.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User } from '../users/entities/user.entity';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pass, PassTransaction, Sponsor, User])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
