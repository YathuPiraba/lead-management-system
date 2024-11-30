import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Set a key-value pair in Redis with optional expiration
   * @param key The key to set
   * @param value The value to store
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a value from Redis by key
   * @param key The key to retrieve
   * @returns The parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   * @param key The key to delete
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if a key exists in Redis
   * @param key The key to check
   * @returns boolean indicating if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error checking existence of key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Set key expiration time
   * @param key The key to expire
   * @param seconds Time in seconds until expiration
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      this.logger.error(
        `Error setting expiration for key ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Add members to a Redis set
   * @param key The set key
   * @param members Members to add to the set
   */
  async sadd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.redis.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Error adding to set ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all members of a Redis set
   * @param key The set key
   * @returns Array of set members
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logger.error(
        `Error getting members of set ${key}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Increment a counter in Redis
   * @param key The counter key
   * @returns The new value
   */
  async increment(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the Redis client instance for advanced operations
   * @returns Redis client instance
   */
  getClient(): Redis {
    return this.redis;
  }
}
