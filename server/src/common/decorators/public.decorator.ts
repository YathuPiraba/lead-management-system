import { SetMetadata } from '@nestjs/common';

/**
 * Custom decorator that marks a route as public, bypassing JWT authentication
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
