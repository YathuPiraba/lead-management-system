import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirstNameAndContactNoToUsers1728284156408
  implements MigrationInterface
{
  name = 'AddFirstNameAndContactNoToUsers1728284156408';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "firstName" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "contactNo" character varying(50)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "contactNo"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
  }
}
