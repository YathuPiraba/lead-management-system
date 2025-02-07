import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStaffAndLeadsTables1675324543174
  implements MigrationInterface
{
  name = 'CreateStaffAndLeadsTables1675324543174';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure the enum types are not created if they already exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status_enum') THEN 
          CREATE TYPE "staff_status_enum" AS ENUM ('Active', 'Inactive'); 
        END IF; 
      END $$;
    `);

    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_performance_enum') THEN 
          CREATE TYPE "staff_performance_enum" AS ENUM ('High', 'Medium', 'Low'); 
        END IF; 
      END $$;
    `);

    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leads_status_enum') THEN 
          CREATE TYPE "leads_status_enum" AS ENUM ('New', 'In Progress', 'Closed'); 
        END IF; 
      END $$;
    `);

    // Create staff table
    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT NOT NULL,
        "status" "staff_status_enum" NOT NULL DEFAULT 'Active',
        "performance" "staff_performance_enum" NOT NULL DEFAULT 'Medium',
        "assignedLeads" INT NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_staff_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create leads table
    await queryRunner.query(`
      CREATE TABLE "leads" (
        "id" SERIAL PRIMARY KEY,
        "staff_id" INT NOT NULL,
        "status" "leads_status_enum" NOT NULL DEFAULT 'New',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT "FK_leads_staff" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE
      );
    `);

    // Create performance table
    await queryRunner.query(`
      CREATE TABLE "performance" (
        "id" SERIAL PRIMARY KEY,
        "staff_id" INT NOT NULL,
        "month" DATE NOT NULL,
        "score" INT NOT NULL,
        CONSTRAINT "FK_performance_staff" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop performance, leads, and staff tables
    await queryRunner.query('DROP TABLE "performance";');
    await queryRunner.query('DROP TABLE "leads";');
    await queryRunner.query('DROP TABLE "staff";');

    // Drop enum types if they exist
    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status_enum') THEN 
          DROP TYPE "staff_status_enum"; 
        END IF; 
      END $$;
    `);

    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_performance_enum') THEN 
          DROP TYPE "staff_performance_enum"; 
        END IF; 
      END $$;
    `);

    await queryRunner.query(`
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leads_status_enum') THEN 
          DROP TYPE "leads_status_enum"; 
        END IF; 
      END $$;
    `);
  }
}
