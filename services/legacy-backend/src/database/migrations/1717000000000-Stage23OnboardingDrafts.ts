import { MigrationInterface, QueryRunner } from 'typeorm';

export class Stage23OnboardingDrafts1717000000000 implements MigrationInterface {
  name = 'Stage23OnboardingDrafts1717000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_onboarding_drafts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        active_step VARCHAR(255) NOT NULL DEFAULT 'account',
        account JSONB NOT NULL DEFAULT '{}'::jsonb,
        kyc JSONB NOT NULL DEFAULT '{}'::jsonb,
        finance JSONB NOT NULL DEFAULT '{}'::jsonb,
        role_variant VARCHAR(255),
        completion_status VARCHAR(255) NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_onboarding_drafts_user_id ON user_onboarding_drafts(user_id);`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_user_onboarding_drafts_role_variant ON user_onboarding_drafts(role_variant);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_onboarding_drafts_role_variant;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_onboarding_drafts_user_id;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_onboarding_drafts;`);
  }
}
