import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Member } from './member.entity';
import { MemberService } from './member.service';

@Module({
  imports: [TypeOrmModule.forFeature([Member, User]), ],
  providers: [MemberService],
  exports: [MemberService], // CRITICAL: This allows AdminController to use it
})
export class MembersModule {}