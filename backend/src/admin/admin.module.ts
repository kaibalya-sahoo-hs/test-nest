import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from 'src/api-logs/api-logs.entity';
import { ApiLogsModule } from 'src/api-logs/api-logs.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { MailModule } from 'src/mail/mail.module';
import { Member } from 'src/member/member.entity';
import { MembersModule } from 'src/member/member.module';
import { MemberService } from 'src/member/member.service';
import { CloudinaryModule } from 'src/upload/upload.module';
import { User } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Member, ApiLog]),
        UsersModule ,
        MembersModule, 
        CloudinaryModule, 
        MailModule, 
        ApiLogsModule],
    providers: [AdminService],
    controllers: [AdminController],
    exports: [AdminService]
})
export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*'); // Log everything, or specify routes
    }
}
