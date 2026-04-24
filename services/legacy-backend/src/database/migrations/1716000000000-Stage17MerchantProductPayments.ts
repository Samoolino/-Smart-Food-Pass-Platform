import { MigrationInterface, QueryRunner } from 'typeorm';

export class Stage17MerchantProductPayments1716000000000 implements MigrationInterface {
  name = 'Stage17MerchantProductPayments1716000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE product_catalog ADD COLUMN IF NOT EXISTS owner_user_id INTEGER;`);
    await queryRunner.query(`ALTER TABLE product_catalog ADD COLUMN IF NOT EXISTS owner_wallet_address VARCHAR(255);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS merchant_product_registry (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        price NUMERIC(12,2) NOT NULL DEFAULT 0,
        inventory_qty INTEGER NOT NULL DEFAULT 0,
        merchant_wallet_address VARCHAR(255),
        product_owner_wallet_address VARCHAR(255),
        payment_provider VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_merchant_product_registry_merchant_id ON merchant_product_registry(merchant_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_merchant_product_registry_product_id ON merchant_product_registry(product_id);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_plan_registry (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        sponsor_id INTEGER,
        plan_code VARCHAR(100) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        tier VARCHAR(100),
        status VARCHAR(100),
        wallet_address VARCHAR(255),
        access_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
        valid_from TIMESTAMP,
        valid_to TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_plan_registry_user_id ON user_plan_registry(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_plan_registry_sponsor_id ON user_plan_registry(sponsor_id);`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payment_settlements (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER,
        product_id INTEGER,
        user_id INTEGER,
        pass_id INTEGER,
        transaction_id INTEGER,
        amount NUMERIC(12,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
        provider VARCHAR(100),
        provider_reference VARCHAR(255),
        settlement_status VARCHAR(100) NOT NULL DEFAULT 'pending',
        payer_wallet_address VARCHAR(255),
        payee_wallet_address VARCHAR(255),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_settlements_merchant_id ON payment_settlements(merchant_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_settlements_user_id ON payment_settlements(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payment_settlements_status ON payment_settlements(settlement_status);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_settlements_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_settlements_user_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payment_settlements_merchant_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS payment_settlements;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_plan_registry_sponsor_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_plan_registry_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_plan_registry;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_merchant_product_registry_product_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_merchant_product_registry_merchant_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS merchant_product_registry;`);

    await queryRunner.query(`ALTER TABLE product_catalog DROP COLUMN IF EXISTS owner_wallet_address;`);
    await queryRunner.query(`ALTER TABLE product_catalog DROP COLUMN IF EXISTS owner_user_id;`);
  }
}
