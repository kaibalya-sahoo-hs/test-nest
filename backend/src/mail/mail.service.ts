import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }
    async sendMail(email:string, name: string, token:string) {
        console.log(email, name, token)
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
    async sendCSVReport(adminEmail: string, csvContent: string, jobId: string | number) {
        try {
            await this.mailerService.sendMail({
                to: adminEmail,
                subject: `User Import Report - Job #${jobId}`,
                // We use 'text' or 'html' instead of 'template' for simple reports
                html: `
                    <h3>Import Process Completed</h3>
                `,
                attachments: [
                    {
                        filename: `import_report_${jobId}.csv`,
                        content: csvContent,
                    },
                ],
            });
            return { success: true };
        } catch (error) {
            console.error('CSV Mail Error:', error);
            return { success: false };
        }
    }
}
