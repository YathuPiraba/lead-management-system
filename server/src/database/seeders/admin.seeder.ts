import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

export class AdminSeeder {
  private readonly configService: ConfigService;

  constructor(
    private dataSource: DataSource,
    configService: ConfigService,
  ) {
    this.configService = configService;
  }

  async run() {
    const userRepository = this.dataSource.getRepository('User');
    const roleRepository = this.dataSource.getRepository('Role');

    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const adminUserName = this.configService.get<string>('ADMIN_USERNAME');

    if (!adminEmail || !adminPassword || !adminUserName) {
      throw new Error(
        'Admin credentials not properly configured in environment variables',
      );
    }

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await argon2.hash(adminPassword);

      // Fetch the admin role
      const adminRole = await roleRepository.findOne({
        where: { id: 1 },
      });

      if (!adminRole) {
        throw new Error('Admin role with ID 1 not found');
      }

      const admin = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        userName: adminUserName,
        role: adminRole,
        isFirstLogin: false,
        isActive: true,
      });

      await userRepository.save(admin);
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists, skipping seeding.');
    }
  }

  async runSqlFile() {
    try {
      const sqlFilePath = path.join(__dirname, '../db.sql');
      const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
      const queries = sqlContent
        .split(';')
        .filter((query) => query.trim().length > 0);

      for (const query of queries) {
        await this.dataSource.query(query);
      }
      console.log('SQL file executed successfully');
    } catch (error) {
      console.error('Error executing SQL file:', error);
      throw error;
    }
  }
}
