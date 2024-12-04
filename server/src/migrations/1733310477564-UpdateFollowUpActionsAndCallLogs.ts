import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFollowUpActionsAndCallLogs1729840026173
  implements MigrationInterface
{
  name = 'UpdateFollowUpActionsAndCallLogs1729840026173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Modify the `followup_actions` table to match `call_log_followups` structure
    await queryRunner.query(
      `DROP TABLE IF EXISTS "followup_actions"`, // Drop the old `followup_actions` table
    );

    await queryRunner.query(
      `CREATE TABLE "call_log_followups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "followup_date" DATE NOT NULL,
        "completed" BOOLEAN NOT NULL DEFAULT false,
        "notes" TEXT,
        "callLogId" uuid,
        "assignedStaffId" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3e6382b14a66b13d6f9ef7c50dd" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "call_log_followups" ADD CONSTRAINT "FK_2fbb4d428fa7b4e9a118b6a1d08" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "call_log_followups" ADD CONSTRAINT "FK_3d087388fd2196b49e12ff2e9f8" FOREIGN KEY ("assignedStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Create ENUM type for status
    await queryRunner.query(
      `CREATE TYPE "call_logs_status_enum" AS ENUM ('open', 'closed')`,
    );

    // Add new columns to `call_logs` table
    await queryRunner.query(
      `ALTER TABLE "call_logs" ADD COLUMN "followup_count" INT DEFAULT 0`,
    );

    await queryRunner.query(
      `ALTER TABLE "call_logs" ADD COLUMN "status" "call_logs_status_enum" DEFAULT 'open'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback changes in reverse order

    // Drop the `call_log_followups` table
    await queryRunner.query(`DROP TABLE "call_log_followups"`);

    // Drop the ENUM type
    await queryRunner.query(`DROP TYPE "call_logs_status_enum"`);

    // Recreate the `followup_actions` table if needed
    await queryRunner.query(
      `CREATE TABLE "followup_actions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action_taken" TEXT NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "callLogId" uuid,
        "userId" integer,
        CONSTRAINT "PK_3e6382b14a66b13d6f9ef7c50dd" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "followup_actions" ADD CONSTRAINT "FK_ed7cce4cc769f876899e47b2df2" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "followup_actions" ADD CONSTRAINT "FK_c2a84e23b5e775e9aaa03a4a985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Remove new columns from `call_logs` table
    await queryRunner.query(
      `ALTER TABLE "call_logs" DROP COLUMN "followup_count"`,
    );
    await queryRunner.query(`ALTER TABLE "call_logs" DROP COLUMN "status"`);
  }
}
