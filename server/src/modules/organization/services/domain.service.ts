import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationConfig } from '../entities/organization_configs.entity';
import { Organization } from '../entities/organizations.entity';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(OrganizationConfig)
    private orgConfigRepo: Repository<OrganizationConfig>,
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
  ) {}

  async doesSubdomainExist(subdomain: string): Promise<boolean> {
    const count = await this.organizationRepo.count({
      where: {
        config: {
          loginUrlSubdomain: subdomain,
        },
      },
      relations: ['config'],
    });
    return count > 0;
  }
}
