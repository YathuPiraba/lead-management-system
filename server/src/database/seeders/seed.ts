import { DataSource } from 'typeorm';
import { AdminSeeder } from './admin.seeder';
import { ConfigService } from '@nestjs/config';

export async function seed(
  dataSource: DataSource,
  configService: ConfigService,
) {
  const adminSeeder = new AdminSeeder(dataSource, configService);
  try {
    // First execute the SQL file
    await adminSeeder.runSqlFile();

    // Then seed the admin user
    await adminSeeder.run();

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}
