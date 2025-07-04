import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organizations.entity';
import { OrganizationConfig } from './entities/organization_configs.entity';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationConfig])],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [TypeOrmModule],
})
export class OrganizationModule {}
