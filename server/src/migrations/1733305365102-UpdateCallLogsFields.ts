import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCallLogsFields1234567890123 implements MigrationInterface {
  name = 'UpdateCallLogsFields1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Alter `call_date` column to be datetime and nullable
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "call_date" TYPE TIMESTAMP USING "call_date"::TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "call_date" DROP NOT NULL`,
    );

    // Alter `next_followup_date` column to be datetime
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "next_followup_date" TYPE TIMESTAMP USING "next_followup_date"::TIMESTAMP`,
    );

    // Make `next_followup_date` nullable
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "next_followup_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert `call_date` to original type and non-nullable
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "call_date" TYPE DATE USING "call_date"::DATE`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "call_date" SET NOT NULL`,
    );

    // Revert `next_followup_date` to original type
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "next_followup_date" TYPE DATE USING "next_followup_date"::DATE`,
    );

    // Revert `next_followup_date` to non-nullable
    await queryRunner.query(
      `ALTER TABLE "call_logs" ALTER COLUMN "next_followup_date" SET NOT NULL`,
    );
  }
}
