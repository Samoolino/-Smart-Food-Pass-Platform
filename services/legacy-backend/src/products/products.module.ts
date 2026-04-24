import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Pass } from '../passes/entities/pass.entity';
import { UserPlan } from '../payments/entities/user-plan.entity';
import { MerchantProductRegistry } from './entities/merchant-product-registry.entity';
import { Product } from './entities/product.entity';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Pass, Merchant, MerchantProductRegistry, UserPlan])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
