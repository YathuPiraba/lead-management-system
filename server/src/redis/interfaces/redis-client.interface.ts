import { Redis } from 'ioredis';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RedisClient extends Redis {}

export interface RefreshTokenData {
  token: string;
  deviceFingerprint?: string;
  ip?: string;
  userAgent: string;
  createdAt: string;
}

export interface Session {
  tokenId: string;
  deviceFingerprint?: string;
  userAgent: string;
  createdAt: string;
  ip?: string;
}
