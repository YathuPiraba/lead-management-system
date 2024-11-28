import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { Logger } from '@nestjs/common';
import IORedis from 'ioredis';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => {
        const logger = new Logger('RedisModule');

        // Create Redis client configuration
        const config: RedisModuleOptions = {
          type: 'single', // Single Redis instance
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
            password: configService.get<string>('REDIS_PASSWORD'),

            retryStrategy(times: number) {
              const delay = Math.min(times * 1000, 20000);
              logger.warn(
                `Attempting to reconnect to Redis... (Attempt ${times})`,
              );
              return delay;
            },

            connectTimeout: 10000,
            maxRetriesPerRequest: 3,
            enableOfflineQueue: true,
            keepAlive: 30000,
            enableReadyCheck: true,
            lazyConnect: true,
            connectionName: 'app-redis-connection',
          },
        };

        // Create a Redis client to attach event listeners
        const client = new IORedis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        });

        client.on('connect', () => {
          logger.log('Successfully connected to Redis');
        });

        client.on('error', (err) => {
          logger.error(`Redis connection error: ${err.message}`);
        });

        client.on('ready', () => {
          logger.log('Redis client is ready');
        });

        client.on('close', () => {
          logger.warn('Redis connection closed');
        });

        client.on('reconnecting', () => {
          logger.warn('Redis client reconnecting');
        });

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  exports: [RedisModule],
})
export class EnhancedRedisModule {}
