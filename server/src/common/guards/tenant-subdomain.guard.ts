import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { OrganizationService } from '../../modules/organization/organization.service';
import { ValidateTenantKey } from '../decorators/validate-tenant.decorator';

@Injectable()
export class TenantSubdomainGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private organizationService: OrganizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route requires tenant validation
    const validateTenant = this.reflector.get<boolean>(
      ValidateTenantKey,
      context.getHandler(),
    );

    // If no decorator, allow by default
    if (!validateTenant) {
      return true;
    }

    const req: Request = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const subdomain = req.headers['x-tenant-subdomain'] as string;

    // Product admin - no orgId, no subdomain required
    if (!user.orgId) {
      if (subdomain) {
        throw new UnauthorizedException(
          'Product admin should not provide subdomain header',
        );
      }
      return true;
    }

    // Tenant user must provide subdomain
    if (!subdomain) {
      throw new UnauthorizedException('Subdomain header missing');
    }

    const org =
      await this.organizationService.findOrgConfigBySubdomain(subdomain);

    if (!org) {
      throw new UnauthorizedException('Invalid organization subdomain');
    }

    if (user.orgId !== org.organization.id) {
      throw new UnauthorizedException('Organization mismatch');
    }

    return true;
  }
}
