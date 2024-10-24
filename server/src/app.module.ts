import { Module } from '@nestjs/common';
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
import { RedisModule } from '@nestjs-modules/ioredis';
import { RedisModuleOptions } from '@nestjs-modules/ioredis';
import { AuthModule } from './auth/auth.module';

console.log('ss', process.env.SECRET_KEY);
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
        const secret = configService.get<string>('SECRET_KEY');

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
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisModuleOptions> => ({
        type: 'single',
        options: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    CloudinaryModule,
    UploadModule,
    UsersModule,
    StudentsModule,
    CallLogsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
