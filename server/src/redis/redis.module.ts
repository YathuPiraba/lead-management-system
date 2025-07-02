import { Module, DynamicModule, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './constants/redis.constants';
import { RedisService } from './redis.service';

@Global()
@Module({})
export class RedisModule {
  static forRoot(): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: REDIS_CLIENT,
          useFactory: (configService: ConfigService) => {
            const logger = new Logger('RedisClient');
            const client = new Redis({
              host: configService.get('redis.host'),
              port: configService.get('redis.port'),
              password: configService.get('redis.password') || undefined,
              retryStrategy: (times) => {
                const delay = Math.min(times * 1000, 10000);
                logger.warn(`Retrying Redis connection (attempt ${times})...`);
                return delay;
              },
            });

            client.on('connect', () => logger.log('Redis CLIENT connected'));
            client.on('ready', () => logger.log('Redis CLIENT ready'));
            client.on('error', (err) =>
              logger.error(`Redis CLIENT error: ${err.message}`),
            );
            client.on('close', () =>
              logger.warn('Redis CLIENT connection closed'),
            );
            client.on('reconnecting', () =>
              logger.warn('Redis CLIENT reconnecting...'),
            );

            return client;
          },
          inject: [ConfigService],
        },
        RedisService,
      ],
      exports: [RedisService, REDIS_CLIENT],
    };
  }
}
