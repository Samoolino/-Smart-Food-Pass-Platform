import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PassesModule } from './passes/passes.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'app_user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'smart_food_pass',
      autoLoadEntities: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.ts,.js}'],
      migrationsRun: true,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    PassesModule,
    MerchantsModule,
    ProductsModule,
    PaymentsModule,
    SponsorsModule,
    AnalyticsModule,
    BlockchainModule,
    AdminModule,
  ],
})
export class AppModule {}
