import { MigrationInterface, QueryRunner } from 'typeorm';

export class Stage10BaselineRuntimeSchema1713900000000 implements MigrationInterface {
  name = 'Stage10BaselineRuntimeSchema1713900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE user_role_enum AS ENUM ('beneficiary', 'sponsor', 'merchant', 'admin', 'super_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE pass_status_enum AS ENUM ('active', 'expired', 'redeemed', 'partial', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE pass_transaction_status_enum AS ENUM ('pending', 'completed', 'rejected');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role user_role_enum NOT NULL DEFAULT 'beneficiary',
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        dob DATE,
        address TEXT,
        profile_image_url VARCHAR(255),
        is_active BOOLEAN NOT NULL DEFAULT true,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        organization_name VARCHAR(255),
        organization_type VARCHAR(255),
        registration_number VARCHAR(255),
        contact_person VARCHAR(255),
        total_funded NUMERIC(15,2) NOT NULL DEFAULT 0,
        is_verified BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_sponsors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsors_user_id ON sponsors(user_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        store_name VARCHAR(255),
        store_address TEXT,
        pos_type VARCHAR(255),
        commission_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
        is_approved BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        total_redeemed NUMERIC(15,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_merchants_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_merchants_user_id ON merchants(user_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS product_catalog (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        brand VARCHAR(255),
        description TEXT,
        nutrition_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        ingredients TEXT,
        product_image_url VARCHAR(255),
        is_approved BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON product_catalog(category);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS passes (
        id SERIAL PRIMARY KEY,
        pass_id_unique VARCHAR(255) NOT NULL UNIQUE,
        qr_code_hash VARCHAR(255),
        beneficiary_id INTEGER NOT NULL,
        sponsor_id INTEGER NOT NULL,
        value NUMERIC(10,2) NOT NULL,
        balance NUMERIC(10,2) NOT NULL,
        validity_start TIMESTAMP NOT NULL DEFAULT now(),
        validity_end TIMESTAMP NOT NULL,
        status pass_status_enum NOT NULL DEFAULT 'active',
        product_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        updated_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_passes_beneficiary FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_passes_sponsor FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_passes_beneficiary_id ON passes(beneficiary_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_passes_sponsor_id ON passes(sponsor_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS pass_transactions (
        id SERIAL PRIMARY KEY,
        pass_id INTEGER NOT NULL,
        merchant_id INTEGER NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status pass_transaction_status_enum NOT NULL DEFAULT 'completed',
        product_purchased JSONB NOT NULL DEFAULT '[]'::jsonb,
        blockchain_tx_hash VARCHAR(255),
        transaction_timestamp TIMESTAMP NOT NULL DEFAULT now(),
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_pass_transactions_pass FOREIGN KEY (pass_id) REFERENCES passes(id) ON DELETE CASCADE,
        CONSTRAINT fk_pass_transactions_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pass_transactions_pass_id ON pass_transactions(pass_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_pass_transactions_merchant_id ON pass_transactions(merchant_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(255) NOT NULL,
        entity_type VARCHAR(255) NOT NULL,
        entity_id INTEGER,
        old_value JSONB,
        new_value JSONB,
        status VARCHAR(50) NOT NULL DEFAULT 'success',
        ip_address VARCHAR(255),
        user_agent TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_entity;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_logs_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_pass_transactions_merchant_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_pass_transactions_pass_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS pass_transactions;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_passes_sponsor_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_passes_beneficiary_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS passes;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_product_catalog_category;`);
    await queryRunner.query(`DROP TABLE IF EXISTS product_catalog;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_merchants_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS merchants;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sponsors_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS sponsors;`);

    await queryRunner.query(`DROP TABLE IF EXISTS users;`);

    await queryRunner.query(`DROP TYPE IF EXISTS pass_transaction_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS pass_status_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
  }
}
