import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './member.entity'; // Adjust path

@Injectable()
export class MemberService {
    constructor(
        @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    ) {}

    async createMember(name: string, designation: string) {
        const newMember = this.memberRepo.create({ name, designation });
        return await this.memberRepo.save(newMember);
    }
    
    async getAllMembers() {
        return await this.memberRepo.find();
    }
    
    async deleteMember(id: number) {
        return await this.memberRepo.delete(id);
    }
}