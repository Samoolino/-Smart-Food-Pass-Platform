import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User } from '../users/entities/user.entity';
import { PassesController } from './passes.controller';
import { Pass } from './entities/pass.entity';
import { PassTransaction } from './entities/pass-transaction.entity';
import { PassesService } from './passes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pass,
      PassTransaction,
      User,
      Sponsor,
      Merchant,
      Product,
    ]),
  ],
  controllers: [PassesController],
  providers: [PassesService],
  exports: [PassesService, TypeOrmModule],
})
export class PassesModule {}
