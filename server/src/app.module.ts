import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { dataSourceOptions } from './data-source';
import { StudentsModule } from './students/students.module';
import { CallLogsModule } from './call-logs/call-logs.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EnhancedRedisModule } from './redis/redis.module';
import { DataSource } from 'typeorm';
import { seed } from './database/seeders/seed';
import { StaffModule } from './staff/staff.module';
import { LeadsModule } from './leads/leads.module';
import { PerformanceModule } from './performance/performance.module';
import { CalllogFollowupsModule } from './calllog_followups/calllog_followups.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_ACCESS_SECRET');

        if (!secret) {
          throw new Error('JWT secret key is not configured');
        }

        return {
          secret,
          global: true,
          signOptions: {
            expiresIn: '15m',
            algorithm: 'HS256',
          },
        };
      },
      inject: [ConfigService],
    }),
    EnhancedRedisModule,
    CloudinaryModule,
    UploadModule,
    UsersModule,
    StudentsModule,
    CallLogsModule,
    AuthModule,
    StaffModule,
    LeadsModule,
    PerformanceModule,
    CalllogFollowupsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    try {
      await seed(this.dataSource, this.configService);
    } catch (error) {
      console.error('Error during database seeding:', error);
    }
  }
}
