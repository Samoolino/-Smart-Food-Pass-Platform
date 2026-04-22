import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { Pass } from '../passes/entities/pass.entity';
import { PassTransaction } from '../passes/entities/pass-transaction.entity';
import { Product } from '../products/entities/product.entity';
import { Sponsor } from '../sponsors/entities/sponsor.entity';
import { User } from '../users/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'app_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'smart_food_pass',
  entities: [User, Sponsor, Merchant, Product, Pass, PassTransaction, AuditLog],
  migrations: ['src/database/migrations/*{.ts,.js}'],
  synchronize: false,
});

export default AppDataSource;
