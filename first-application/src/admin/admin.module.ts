import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/member.entity';
import { MembersModule } from 'src/member/member.module';
import { MemberService } from 'src/member/member.service';
import { CloudinaryModule } from 'src/upload/upload.module';
import { User } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Member]),UsersModule ,MembersModule, CloudinaryModule],
    providers: [AdminService, MemberService],
    controllers: [AdminController],
    exports: [AdminService]
})
export class AdminModule {}
