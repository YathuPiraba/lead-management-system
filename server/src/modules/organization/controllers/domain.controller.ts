import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { DomainService } from '../services/domain.service';
import {
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Tenants')
@Controller('tenant')
export class OrganizationController {
  constructor(private readonly domainService: DomainService) {}

  @Public()
  @Get('validate/:subdomain')
  @ApiOperation({ summary: 'Validate if organization subdomain exists' })
  @ApiParam({
    name: 'subdomain',
    type: String,
    description: 'The subdomain (e.g. oxford)',
  })
  @ApiOkResponse({
    description: 'Validation result',
    schema: {
      example: {
        exists: true,
      },
    },
  })
  async validateSubdomain(
    @Param('subdomain') subdomain: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.domainService.doesSubdomainExist(subdomain);
    return { exists };
  }
}
