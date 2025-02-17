import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffAndStudentsTables1728284156407
  implements MigrationInterface
{
  name = 'CreateStaffAndStudentsTables1728284156407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status_enum') THEN 
          CREATE TYPE "staff_status_enum" AS ENUM ('Active', 'Inactive'); 
        END IF; 
      END $$;
    `);

    // Create 'students' table
    await queryRunner.query(
      `CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "address" character varying(255),
        "phone_number" character varying(50) NOT NULL,
        "department_of_study" character varying(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id")
      )`,
    );

    // Create 'staff' table with firstName, contactNo columns added
    await queryRunner.query(
      `CREATE TABLE "staff" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL,
        "firstName" character varying(255) NOT NULL,
        "contactNo" character varying(50) NOT NULL,
        "status" "staff_status_enum" NOT NULL DEFAULT 'Active',
        "assignedLeads" INT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop 'staff' table
    await queryRunner.query(`DROP TABLE "staff"`);

    // Drop 'students' table
    await queryRunner.query(`DROP TABLE "students"`);
  }
}
