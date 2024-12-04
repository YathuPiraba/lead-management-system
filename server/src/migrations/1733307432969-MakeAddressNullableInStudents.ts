import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeAddressNullableInStudents1234567890123
  implements MigrationInterface
{
  name = 'MakeAddressNullableInStudents1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make `address` column nullable
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "address" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert `address` column to non-nullable
    await queryRunner.query(
      `ALTER TABLE "students" ALTER COLUMN "address" SET NOT NULL`,
    );
  }
}
