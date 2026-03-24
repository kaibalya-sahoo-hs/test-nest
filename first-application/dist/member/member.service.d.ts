import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Member } from './member.entity';
export declare class MemberService {
    private readonly memberRepo;
    private readonly userRepo;
    constructor(memberRepo: Repository<Member>, userRepo: Repository<User>);
    createMember(name: string, email: string, password: string): Promise<any>;
    getAllMembers(): Promise<any>;
    deleteMember(id: number): Promise<any>;
}
