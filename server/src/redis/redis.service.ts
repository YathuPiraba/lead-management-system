import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { REDIS_CLIENT } from './constants/redis.constants';
import { RedisClient } from './interfaces/redis-client.interface';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClient,
  ) {}
  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }
}
