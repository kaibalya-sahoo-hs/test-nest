import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Member } from 'src/member/member.entity';
import { MailService } from 'src/mail/mail.service';
export declare class AuthService {
    private userRepo;
    private readonly memberRepo;
    private JwtService;
    private mailService;
    constructor(userRepo: Repository<User>, memberRepo: Repository<Member>, JwtService: JwtService, mailService: MailService);
    instializeRegistration({ name, email }: {
        name: any;
        email: any;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    completeRegistartion({ token, password }: {
        token: any;
        password: any;
    }): Promise<{
        message: string;
        success: boolean;
    }>;
    loginUser({ email, password }: {
        email: any;
        password: any;
    }): Promise<{
        message: string;
        success: boolean;
        mesage?: undefined;
        user?: undefined;
        token?: undefined;
    } | {
        mesage: string;
        user: {
            id: any;
            name: any;
            email: any;
            profile: any;
        };
        token: any;
        success: boolean;
        message?: undefined;
    }>;
}
