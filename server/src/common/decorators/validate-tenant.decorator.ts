import { SetMetadata } from '@nestjs/common';

export const ValidateTenantKey = 'validateTenant';

export const ValidateTenant = () => SetMetadata(ValidateTenantKey, true);
