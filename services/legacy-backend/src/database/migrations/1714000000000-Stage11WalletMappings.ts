import { MigrationInterface, QueryRunner } from 'typeorm';

export class Stage11WalletMappings1714000000000 implements MigrationInterface {
  name = 'Stage11WalletMappings1714000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(255);`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_sponsors_wallet_address ON sponsors(wallet_address);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_merchants_wallet_address ON merchants(wallet_address);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_merchants_wallet_address;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsors_wallet_address;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_wallet_address;`);

    await queryRunner.query(`ALTER TABLE merchants DROP COLUMN IF EXISTS wallet_address;`);
    await queryRunner.query(`ALTER TABLE sponsors DROP COLUMN IF EXISTS wallet_address;`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS wallet_address;`);
  }
}
