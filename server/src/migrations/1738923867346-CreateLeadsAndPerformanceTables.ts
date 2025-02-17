import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLeadsAndPerformanceTables1738923867346
  implements MigrationInterface
{
  name = 'CreateLeadsAndPerformanceTables1738923867346';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for lead status
    await queryRunner.query(
      `CREATE TYPE "leads_status_enum" AS ENUM ('New', 'In Progress', 'Converted', 'Closed')`,
    );

    // Create leads table
    await queryRunner.query(`
      CREATE TABLE "leads" (
        "id" SERIAL PRIMARY KEY,
        "staff_id" INT NOT NULL,
        "callLogId" uuid,
        "status" "leads_status_enum" NOT NULL DEFAULT 'New',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_leads_staff" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_leads_call_log" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE
      )
    `);

    // Create performance table
    await queryRunner.query(`
      CREATE TABLE "performance" (
        "id" SERIAL PRIMARY KEY,
        "staff_id" INT NOT NULL,
        "month" DATE NOT NULL,
        "score" INT NOT NULL,
        CONSTRAINT "FK_performance_staff" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables
    await queryRunner.query(`DROP TABLE "performance"`);
    await queryRunner.query(`DROP TABLE "leads"`);

    // Drop ENUM type
    await queryRunner.query(`DROP TYPE "leads_status_enum"`);
  }
}
