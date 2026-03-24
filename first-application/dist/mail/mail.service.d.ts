import { MailerService } from '@nestjs-modules/mailer';
export declare class MailService {
    private mailerService;
    constructor(mailerService: MailerService);
    sendMail(email: string, name: string, token: string): Promise<{
        success: boolean;
    }>;
}
