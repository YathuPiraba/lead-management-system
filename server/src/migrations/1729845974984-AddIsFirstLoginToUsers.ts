import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsFirstLoginToUsers1728284156407 implements MigrationInterface {
  name = 'AddIsFirstLoginToUsers1728284156407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isFirstLogin" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isFirstLogin"`);
  }
}
