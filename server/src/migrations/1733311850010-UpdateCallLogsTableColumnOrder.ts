import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCallLogsTableColumnOrder1728284156406
  implements MigrationInterface
{
  name = 'UpdateCallLogsTableColumnOrder1728284156406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop dependent foreign key constraints first (if they exist)
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_3ba7bfcbf4bf9a356b70d236814"`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_log_followups" DROP CONSTRAINT IF EXISTS "FK_2fbb4d428fa7b4e9a118b6a1d08"`,
    );

    // Drop the primary key constraint (cascade if needed)
    await queryRunner.query(
      `ALTER TABLE "call_logs" DROP CONSTRAINT IF EXISTS "PK_aa08476bcc13bfdf394261761e9"`,
    );

    // Create a new table with the required column order and constraints
    await queryRunner.query(`
      CREATE TABLE "call_logs_new" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid,
        "userId" integer,
        "call_date" date NOT NULL,
        "next_followup_date" date,
        "notes" text,
        "repeat_followup" boolean NOT NULL DEFAULT false,
        "do_not_followup" boolean NOT NULL DEFAULT false,
        "followup_count" integer NOT NULL DEFAULT 0,
        "status" character varying(255) NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_call_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_f2da17a62a00127b732db53f16e" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_b0ab678dddebf33707deb67d76f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Copy data from the old table to the new one
    await queryRunner.query(`
      INSERT INTO "call_logs_new" ("id", "studentId", "userId", "call_date", "next_followup_date", "notes", "repeat_followup", "do_not_followup", "followup_count", "status", "created_at", "updated_at")
      SELECT "id", "studentId", "userId", "call_date", "next_followup_date", "notes", "repeat_followup", "do_not_followup", "followup_count", "status", "created_at", "updated_at"
      FROM "call_logs"
    `);

    // Drop the old table
    await queryRunner.query(`DROP TABLE "call_logs"`);

    // Rename the new table to match the original table name
    await queryRunner.query(
      `ALTER TABLE "call_logs_new" RENAME TO "call_logs"`,
    );

    // Recreate the foreign key constraints on the dependent tables
    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_3ba7bfcbf4bf9a356b70d236814" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "call_log_followups" ADD CONSTRAINT "FK_2fbb4d428fa7b4e9a118b6a1d08" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Create the old structure of the call_logs table
    await queryRunner.query(`
      CREATE TABLE "call_logs_old" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "call_date" date NOT NULL,
        "next_followup_date" date,
        "notes" text,
        "repeat_followup" boolean NOT NULL DEFAULT false,
        "do_not_followup" boolean NOT NULL DEFAULT false,
        "followup_count" integer NOT NULL DEFAULT 0,
        "status" character varying(255) NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "studentId" uuid,
        "userId" integer,
        CONSTRAINT "PK_call_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_f2da17a62a00127b732db53f16e" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_b0ab678dddebf33707deb67d76f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Copy data from the current table back to the old structure
    await queryRunner.query(`
      INSERT INTO "call_logs_old" ("id", "call_date", "next_followup_date", "notes", "repeat_followup", "do_not_followup", "followup_count", "status", "created_at", "updated_at", "studentId", "userId")
      SELECT "id", "call_date", "next_followup_date", "notes", "repeat_followup", "do_not_followup", "followup_count", "status", "created_at", "updated_at", "studentId", "userId"
      FROM "call_logs"
    `);

    // Drop the new table
    await queryRunner.query(`DROP TABLE "call_logs"`);

    // Rename the old table back to "call_logs"
    await queryRunner.query(
      `ALTER TABLE "call_logs_old" RENAME TO "call_logs"`,
    );

    // Recreate the foreign key constraints on the dependent tables
    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_3ba7bfcbf4bf9a356b70d236814" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "call_log_followups" ADD CONSTRAINT "FK_2fbb4d428fa7b4e9a118b6a1d08" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }
}
