// ✅ NestJS Core
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

// ✅ NestJS Built-in Modules
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';

// ✅ Application Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

// ✅ Configuration Files
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { appConfig } from './config/app.config';
import { mailConfig } from './config/mail.config';

// ✅ Common Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/role.guard';
import { TenantSubdomainGuard } from './common/guards/tenant-subdomain.guard';

// ✅ Shared Modules
import { RedisModule } from './redis/redis.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';

// ✅ Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { StaffModule } from './modules/staff/staff.module';
import { SubscriptionModule } from './modules/subscriptions/subscription.module';
import { ActivityModule } from './modules/activity-logs/activity.module';
import { UserModule } from './modules/user/user.module';

// ✅ Seeders / Initial Data
import { ProductAdminSeeder } from './database/seeders/initial-data.seed';

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
    MailModule,

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
  providers: [
    AppService,
    ProductAdminSeeder,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantSubdomainGuard,
    },
  ],
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
