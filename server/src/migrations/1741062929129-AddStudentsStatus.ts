import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentStatus1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "students" ADD COLUMN "status" character varying(50) NOT NULL DEFAULT 'lead' CHECK ("status" IN ('hold', 'active', 'lead','reject'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "status"`);
  }
}
