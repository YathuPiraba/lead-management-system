import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_ACCESS_SECRET || 'supersecret',
  expiresIn: process.env.JWT_EXPIRATION || '1d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshsupersecret',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
