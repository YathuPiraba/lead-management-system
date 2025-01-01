import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCallDateToTimestamp1728284156407
  implements MigrationInterface
{
  name = 'UpdateCallDateToTimestamp1728284156407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Modify the column types from date to timestamp
    await queryRunner.query(`
      ALTER TABLE "call_logs"
      ALTER COLUMN "call_date" TYPE TIMESTAMP USING "call_date"::TIMESTAMP;
    `);

    await queryRunner.query(`
      ALTER TABLE "call_logs"
      ALTER COLUMN "next_followup_date" TYPE TIMESTAMP USING "next_followup_date"::TIMESTAMP;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the column types back to date
    await queryRunner.query(`
      ALTER TABLE "call_logs"
      ALTER COLUMN "call_date" TYPE DATE USING "call_date"::DATE;
    `);

    await queryRunner.query(`
      ALTER TABLE "call_logs"
      ALTER COLUMN "next_followup_date" TYPE DATE USING "next_followup_date"::DATE;
    `);
  }
}
