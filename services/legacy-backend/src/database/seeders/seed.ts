import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Product } from '../../products/entities/product.entity';
import { Sponsor } from '../../sponsors/entities/sponsor.entity';
import { User, UserRole } from '../../users/entities/user.entity';

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const sponsorRepository = AppDataSource.getRepository(Sponsor);
  const merchantRepository = AppDataSource.getRepository(Merchant);
  const productRepository = AppDataSource.getRepository(Product);
  const passwordHash = await bcrypt.hash('Password123', 10);

  const seedUsers = [
    { email: 'admin@smartfoodpass.dev', role: UserRole.ADMIN, firstName: 'System', lastName: 'Admin' },
    { email: 'sponsor@smartfoodpass.dev', role: UserRole.SPONSOR, firstName: 'Demo', lastName: 'Sponsor' },
    { email: 'merchant@smartfoodpass.dev', role: UserRole.MERCHANT, firstName: 'Demo', lastName: 'Merchant' },
    { email: 'beneficiary@smartfoodpass.dev', role: UserRole.BENEFICIARY, firstName: 'Demo', lastName: 'Beneficiary' },
  ];

  const savedUsers: User[] = [];

  for (const seedUser of seedUsers) {
    let user = await userRepository.findOne({ where: { email: seedUser.email } });

    if (!user) {
      user = await userRepository.save(
        userRepository.create({
          email: seedUser.email,
          passwordHash,
          role: seedUser.role,
          firstName: seedUser.firstName,
          lastName: seedUser.lastName,
          isActive: true,
          emailVerified: true,
        }),
      );
    }

    savedUsers.push(user);
  }

  const sponsorUser = savedUsers.find((user) => user.role === UserRole.SPONSOR);
  if (sponsorUser) {
    const sponsor = await sponsorRepository.findOne({ where: { userId: sponsorUser.id } });
    if (!sponsor) {
      await sponsorRepository.save(
        sponsorRepository.create({
          userId: sponsorUser.id,
          organizationName: 'Demo Sponsor Org',
          organizationType: 'NGO',
          registrationNumber: 'SFP-001',
          contactPerson: 'Demo Sponsor',
          totalFunded: 10000,
          isVerified: true,
        }),
      );
    }
  }

  const merchantUser = savedUsers.find((user) => user.role === UserRole.MERCHANT);
  if (merchantUser) {
    const merchant = await merchantRepository.findOne({ where: { userId: merchantUser.id } });
    if (!merchant) {
      await merchantRepository.save(
        merchantRepository.create({
          userId: merchantUser.id,
          storeName: 'Demo Merchant Store',
          storeAddress: 'Demo Address',
          posType: 'smartphone',
          commissionRate: 2,
          isApproved: true,
          isActive: true,
          totalRedeemed: 0,
        }),
      );
    }
  }

  const sampleProducts = [
    { productName: 'Rice Pack', category: 'grains', brand: 'Demo', isApproved: true },
    { productName: 'Milk Pack', category: 'dairy', brand: 'Demo', isApproved: true },
    { productName: 'Beans Pack', category: 'protein', brand: 'Demo', isApproved: true },
  ];

  for (const sampleProduct of sampleProducts) {
    const existingProduct = await productRepository.findOne({ where: { productName: sampleProduct.productName } });
    if (!existingProduct) {
      await productRepository.save(productRepository.create(sampleProduct));
    }
  }

  console.log('Stage 2 starter seed complete');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Stage 2 starter seed failed', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
