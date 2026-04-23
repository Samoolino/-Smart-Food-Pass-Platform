import { MigrationInterface, QueryRunner } from 'typeorm';

export class Stage14ChainPersistence1715000000000 implements MigrationInterface {
  name = 'Stage14ChainPersistence1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE passes ADD COLUMN IF NOT EXISTS issuance_blockchain_tx_hash VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE passes ADD COLUMN IF NOT EXISTS issuance_blockchain_network VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE passes ADD COLUMN IF NOT EXISTS issuance_blockchain_mode VARCHAR(255);`);
    await queryRunner.query(`ALTER TABLE passes ADD COLUMN IF NOT EXISTS issued_on_chain_at TIMESTAMP;`);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_passes_issuance_blockchain_tx_hash ON passes(issuance_blockchain_tx_hash);`);

    await queryRunner.query(`
      CREATE TYPE blockchain_reconciliation_event_type AS ENUM ('pass_issuance', 'pass_redemption');
    `).catch(() => undefined);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blockchain_reconciliation_events (
        id SERIAL PRIMARY KEY,
        pass_id INTEGER,
        transaction_id INTEGER,
        event_type blockchain_reconciliation_event_type NOT NULL,
        tx_hash VARCHAR(255),
        network VARCHAR(255),
        mode VARCHAR(255),
        status VARCHAR(255),
        sponsor_wallet_address VARCHAR(255),
        beneficiary_wallet_address VARCHAR(255),
        merchant_wallet_address VARCHAR(255),
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blockchain_reconciliation_events_pass_id ON blockchain_reconciliation_events(pass_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blockchain_reconciliation_events_transaction_id ON blockchain_reconciliation_events(transaction_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blockchain_reconciliation_events_tx_hash ON blockchain_reconciliation_events(tx_hash);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_blockchain_reconciliation_events_event_type ON blockchain_reconciliation_events(event_type);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_blockchain_reconciliation_events_event_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_blockchain_reconciliation_events_tx_hash;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_blockchain_reconciliation_events_transaction_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_blockchain_reconciliation_events_pass_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS blockchain_reconciliation_events;`);
    await queryRunner.query(`DROP TYPE IF EXISTS blockchain_reconciliation_event_type;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_passes_issuance_blockchain_tx_hash;`);
    await queryRunner.query(`ALTER TABLE passes DROP COLUMN IF EXISTS issued_on_chain_at;`);
    await queryRunner.query(`ALTER TABLE passes DROP COLUMN IF EXISTS issuance_blockchain_mode;`);
    await queryRunner.query(`ALTER TABLE passes DROP COLUMN IF EXISTS issuance_blockchain_network;`);
    await queryRunner.query(`ALTER TABLE passes DROP COLUMN IF EXISTS issuance_blockchain_tx_hash;`);
  }
}
