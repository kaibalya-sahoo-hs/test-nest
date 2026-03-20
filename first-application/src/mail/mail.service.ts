import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }
    async sendMail(email:string, name: string, token:string) {
        try {
            const url = `${process.env.FRONTRND_URL+token}`;
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome! Confirm your Email',
                template: 'confirmation', // Name of the template file (confirmation.ejs)
                context: {
                    name: name,
                    url: url,
                },
            });
            return {success: true}
        } catch (error) {
            console.log(error)
            return {success: false}
        }
    }
}
