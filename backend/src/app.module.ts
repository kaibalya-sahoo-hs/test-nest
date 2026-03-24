import { Module } from '@nestjs/common';
import { AppController, TestController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './mail/mail.module';
import { CloudinaryService } from './upload/upload.service';
import { CloudinaryModule } from './upload/upload.module';
import { AdminController } from './admin/admin.controller';
import { AdminModule } from './admin/admin.module';
import { MembersModule } from './member/member.module';
import { ApiLogsService } from './api-logs/api-logs.service';
import { ApiLogsModule } from './api-logs/api-logs.module';
import { ApiLog } from './api-logs/api-logs.entity';
import { User } from './users/users.entity';
import { redisStore } from 'cache-manager-redis-yet'
import { CacheModule } from "@nestjs/cache-manager"

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
    CacheModule.registerAsync({
      useFactory: async () => ({
          isGlobal: true,
          store: await redisStore({
              url: 'redis://localhost:6379',
              ttl: 60000,
          })
      })
  }),
    TypeOrmModule.forFeature([User ,ApiLog]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // dev only
    }),
    
    UsersModule,
    MembersModule,
    AuthModule,
    MailModule,
    CloudinaryModule,
    AdminModule,
    ApiLogsModule,
  ],
  controllers: [AppController, TestController, AdminController],
  providers: [AppService, CloudinaryService, ApiLogsService],
})
export class AppModule {}
