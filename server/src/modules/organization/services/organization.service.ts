import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationConfig } from '../entities/organization_configs.entity';
import { Organization } from '../entities/organizations.entity';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationConfig)
    private orgConfigRepo: Repository<OrganizationConfig>,
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
  ) {}

  async findOrgBySubdomain(subdomain: string): Promise<Organization | null> {
    return this.organizationRepo.findOne({
      where: {
        config: {
          loginUrlSubdomain: subdomain,
        },
      },
      relations: ['config'],
    });
  }
}
