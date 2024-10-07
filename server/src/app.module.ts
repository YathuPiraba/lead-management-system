import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { dataSourceOptions } from './data-source';
import { StudentsModule } from './students/students.module';
import { CallLogsModule } from './call-logs/call-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceOptions,
    }),
    CloudinaryModule,
    UploadModule,
    UsersModule,
    StudentsModule,
    CallLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
