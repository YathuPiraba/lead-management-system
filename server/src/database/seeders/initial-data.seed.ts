import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../../modules/user/entities/users.entity';
import { Role } from '../../modules/user/entities/roles.entity';

@Injectable()
export class ProductAdminSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async seed() {
    // Ensure roles exist
    await this.ensureRolesExist();

    const userRepository = this.dataSource.getRepository(User);
    const roleRepository = this.dataSource.getRepository(Role);

    // Find the product_admin role
    const productAdminRole = await roleRepository.findOne({
      where: { name: 'product_admin' },
    });

    if (!productAdminRole) {
      console.error('❌ Product admin role not found');
      return;
    }

    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existing = await userRepository.findOne({ where: { email } });

    if (existing) {
      console.log('ℹ️ Product admin already exists, skipping creation');
      return;
    }

    const admin = userRepository.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      email,
      password: await argon2.hash(
        process.env.ADMIN_PASSWORD || 'adminPassword123',
      ),
      role: productAdminRole,
      isFirstLogin: true,
    });

    await userRepository.save(admin);
    console.log('✅ Product admin created successfully');
  }

  private async ensureRolesExist() {
    const roleRepository = this.dataSource.getRepository(Role);

    // Add org_staff role here
    const requiredRoles = [
      {
        name: 'product_admin',
        description: 'Product administrator with full system access',
      },
      {
        name: 'org_admin',
        description: 'Organization administrator with org-specific access',
      },
      {
        name: 'org_staff',
        description: 'Organization staff with limited org access',
      },
    ];

    for (const roleData of requiredRoles) {
      const existingRole = await roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const newRole = roleRepository.create(roleData);
        await roleRepository.save(newRole);
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`ℹ️ Role ${roleData.name} already exists`);
      }
    }
  }
}
