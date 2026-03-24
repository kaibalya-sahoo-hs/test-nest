import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Member } from './member.entity'; // Adjust path
import bcrypt from 'bcrypt'

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,

    ) {}

    async createMember(name: string, email: string, password: string) {
        if(name === '' || email === ''|| password === ''){
            return {'message': 'Empty credentials are not allowed', success: false}
        }
        const hashedPass = await bcrypt.hash(password, 10)
        const newMember = this.userRepo.create({ name, email, password: hashedPass, role: 'member'});
        return await this.userRepo.save(newMember);
    }
    
    async getAllMembers() {
        return await this.memberRepo.find();
    }
    
    async deleteMember(id: number) {
        return await this.memberRepo.delete(id);
    }
}