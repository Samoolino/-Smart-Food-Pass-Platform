import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Product } from '../products/entities/product.entity';
import { MerchantProductRegistry } from '../products/entities/merchant-product-registry.entity';
import { User } from '../users/entities/user.entity';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentSettlement } from './entities/payment-settlement.entity';
import { UserPlan } from './entities/user-plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPlan, PaymentSettlement, User, Merchant, Product, MerchantProductRegistry])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}
