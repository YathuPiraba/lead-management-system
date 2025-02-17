import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCallLogsAndFollowups1728284156409
  implements MigrationInterface
{
  name = 'CreateCallLogsAndFollowups1728284156409';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ENUM type for status
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_log_status_enum') THEN
          CREATE TYPE "call_log_status_enum" AS ENUM ('open', 'closed');
        END IF;
      END $$;
    `);

    // Create call_logs table
    await queryRunner.query(`
      CREATE TABLE "call_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leadNo" character varying NOT NULL UNIQUE,
        "studentId" uuid,
        "userId" integer,
        "call_date" TIMESTAMP NOT NULL,
        "repeat_followup" boolean NOT NULL DEFAULT false,
        "do_not_followup" boolean NOT NULL DEFAULT false,
        "notes" TEXT,
        "followup_count" integer NOT NULL DEFAULT 0,
        "status" "call_log_status_enum" NOT NULL DEFAULT 'open',
        "isExpired" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_call_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_f2da17a62a00127b732db53f16e" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_b0ab678dddebf33707deb67d76f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    // Create call_log_followups table
    await queryRunner.query(`
      CREATE TABLE "call_log_followups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "callLogId" uuid,
        "followup_date" TIMESTAMP NOT NULL,
        "assignedStaffId" integer,
        "notes" TEXT,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3e6382b14a66b13d6f9ef7c50dd" PRIMARY KEY ("id"),
        CONSTRAINT "FK_callLog_followup_callLog" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_callLog_followup_staff" FOREIGN KEY ("assignedStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `);

    // Auto-incrementing leadNo pattern (Lead #0001, Lead #0002, etc.)
    await queryRunner.query(`
      CREATE SEQUENCE lead_no_seq START 1;
      CREATE OR REPLACE FUNCTION generate_lead_no() RETURNS TRIGGER AS $$
      BEGIN
        NEW.leadNo := 'Lead #' || LPAD(nextval('lead_no_seq')::TEXT, 4, '0');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER set_lead_no
      BEFORE INSERT ON "call_logs"
      FOR EACH ROW EXECUTE FUNCTION generate_lead_no();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers and sequences
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS set_lead_no ON "call_logs"`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS generate_lead_no`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS lead_no_seq`);

    // Drop call_log_followups table
    await queryRunner.query(`DROP TABLE "call_log_followups"`);

    // Drop call_logs table
    await queryRunner.query(`DROP TABLE "call_logs"`);

    // Drop ENUM type
    await queryRunner.query(`DROP TYPE "call_log_status_enum"`);
  }
}
