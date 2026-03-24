import { MailService } from "src/mail/mail.service";
import { MemberService } from "src/member/member.service";
import { UserService } from "src/users/users.service";
import { AdminService } from "./admin.service";
export declare class AdminController {
    private readonly adminService;
    private readonly memberService;
    private userSevice;
    private mailService;
    constructor(adminService: AdminService, memberService: MemberService, userSevice: UserService, mailService: MailService);
    getAllUsers(): any;
    deleteUser(body: any): any;
    addMember(body: {
        name: string;
        email: string;
        password: string;
    }): Promise<any>;
    editUserInfo(body: any): Promise<any>;
    removeMember(id: number): Promise<any>;
    uploadProfile(file: Express.Multer.File, body: any): Promise<any>;
    sendmail(body: any): Promise<{
        message: string;
        success: boolean;
    }>;
}
