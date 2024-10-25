import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFollowUpActionsAndNotifications1729839926172
  implements MigrationInterface
{
  name = 'CreateFollowUpActionsAndNotifications1729839926172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "callLogId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "followup_actions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action_taken" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "callLogId" uuid, "userId" integer, CONSTRAINT "PK_3e6382b14a66b13d6f9ef7c50dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_3ba7bfcbf4bf9a356b70d236814" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "followup_actions" ADD CONSTRAINT "FK_ed7cce4cc769f876899e47b2df2" FOREIGN KEY ("callLogId") REFERENCES "call_logs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "followup_actions" ADD CONSTRAINT "FK_c2a84e23b5e775e9aaa03a4a985" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "followup_actions" DROP CONSTRAINT "FK_c2a84e23b5e775e9aaa03a4a985"`,
    );
    await queryRunner.query(
      `ALTER TABLE "followup_actions" DROP CONSTRAINT "FK_ed7cce4cc769f876899e47b2df2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_3ba7bfcbf4bf9a356b70d236814"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );
    await queryRunner.query(`DROP TABLE "followup_actions"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
