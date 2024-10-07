import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentsAndCallLogs1728284156405
  implements MigrationInterface
{
  name = 'CreateStudentsAndCallLogs1728284156405';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "phone_number" character varying(50) NOT NULL, "department_of_study" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "call_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "call_date" date NOT NULL, "next_followup_date" date, "notes" text, "repeat_followup" boolean NOT NULL DEFAULT false, "do_not_followup" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "studentId" uuid, "userId" integer, CONSTRAINT "PK_aa08476bcc13bfdf394261761e9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_logs" ADD CONSTRAINT "FK_f2da17a62a00127b732db53f16e" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_logs" ADD CONSTRAINT "FK_b0ab678dddebf33707deb67d76f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "call_logs" DROP CONSTRAINT "FK_b0ab678dddebf33707deb67d76f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "call_logs" DROP CONSTRAINT "FK_f2da17a62a00127b732db53f16e"`,
    );
    await queryRunner.query(`DROP TABLE "call_logs"`);
    await queryRunner.query(`DROP TABLE "students"`);
  }
}
