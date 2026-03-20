import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/upload/upload.module';
import { UserController } from './users.controller';
import { User } from './users.entity';
import { UserService } from './users.service';


@Module({
  imports: [TypeOrmModule.forFeature([User]), CloudinaryModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UsersModule {}
