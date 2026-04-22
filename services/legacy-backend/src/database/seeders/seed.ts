import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import AppDataSource from '../data-source';
import { User, UserRole } from '../../users/entities/user.entity';

async function seed() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('Password123', 10);

  const seedUsers = [
    { email: 'admin@smartfoodpass.dev', role: UserRole.ADMIN },
    { email: 'sponsor@smartfoodpass.dev', role: UserRole.SPONSOR },
    { email: 'merchant@smartfoodpass.dev', role: UserRole.MERCHANT },
    { email: 'beneficiary@smartfoodpass.dev', role: UserRole.BENEFICIARY },
  ];

  for (const seedUser of seedUsers) {
    const existingUser = await userRepository.findOne({ where: { email: seedUser.email } });

    if (!existingUser) {
      await userRepository.save(
        userRepository.create({
          email: seedUser.email,
          passwordHash,
          role: seedUser.role,
          isActive: true,
          emailVerified: true,
        }),
      );
    }
  }

  console.log('Starter seed complete');
  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error('Starter seed failed', error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
