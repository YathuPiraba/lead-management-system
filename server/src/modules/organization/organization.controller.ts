import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { Organization } from './entities/organizations.entity';
import { OrganizationService } from './organization.service';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Organizations')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Public()
  @Get(':subdomain')
  @ApiOperation({ summary: 'Get organization by subdomain' })
  @ApiParam({
    name: 'subdomain',
    type: String,
    description: 'The subdomain (e.g. oxford)',
  })
  @ApiOkResponse({
    description: 'Organization retrieved successfully',
    type: Organization,
  })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  async findOrg(@Param('subdomain') subdomain: string): Promise<Organization> {
    const org = await this.organizationService.findOrgBySubdomain(subdomain);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }
}
