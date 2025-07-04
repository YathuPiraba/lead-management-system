import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { appConfig } from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mailConfig } from './config/mail.config';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { StaffModule } from './modules/staff/staff.module';
import { SubscriptionModule } from './modules/subscriptions/subscription.module';
import { ActivityModule } from './modules/activity-logs/activity.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './modules/user/user.module';
import { ProductAdminSeeder } from './database/seeders/initial-data.seed';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, appConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.get('database');
        if (!databaseConfig) {
          throw new Error('Database configuration is missing');
        }
        return databaseConfig;
      },
      inject: [ConfigService],
    }),
    RedisModule.forRoot(),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // Time to live (seconds)
          limit: 10, // Max 10 requests per minute per IP
        },
      ],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn', '1d'),
        },
      }),
    }),

    CloudinaryModule,

    AuthModule,
    ContactsModule,
    NotificationModule,
    OrganizationModule,
    StaffModule,
    SubscriptionModule,
    ActivityModule,
    UserModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService, ProductAdminSeeder],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly seeder: ProductAdminSeeder) {}

  async onApplicationBootstrap() {
    try {
      await this.seeder.seed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error during database initialization:', error);
      throw error;
    }
  }
}
