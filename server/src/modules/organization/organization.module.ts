import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organizations.entity';
import { OrganizationConfig } from './entities/organization_configs.entity';
import { OrganizationService } from './services/organization.service';
import { DomainService } from './services/domain.service';
import { OrganizationController } from './controllers/organization.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrganizationConfig])],
  providers: [OrganizationService, DomainService],
  controllers: [OrganizationController],
  exports: [OrganizationService, DomainService],
})
export class OrganizationModule {}
