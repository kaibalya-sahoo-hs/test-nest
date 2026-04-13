import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstant } from './jwtContants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { AdminController } from '../admin/admin.controller';
import { Member } from 'src/member/member.entity';
import { MembersModule } from 'src/member/member.module';
import { MailModule } from 'src/mail/mail.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [ BullModule.registerQueue({name: 'mail-queue'}),TypeOrmModule.forFeature([User, Member]), MembersModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
