import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }
    async sendMail(email: string, name: string, token: string) {
        try {
            const url = `${process.env.FRONTEND_URL}/auth/register/complete?token=${token}`;
            await this.mailerService.sendMail({
                to: email,
                subject: 'Welcome! Confirm your Email',
                template: 'confirmation', // Name of the template file (confirmation.ejs)
                context: {
                    name: name,
                    url: url,
                },
            });
            return { success: true }
        } catch (error) {
            console.log(error)
            return { success: false }
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

    async sendOrderConfirmationMail(email, orderDetails, pdfBuffer) {

        await this.mailerService.sendMail({
            to: email,
            subject: 'Order Placed Successfully',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #4379EE;">Order Placed!</h1>
                <p style="color: #666;">Thank you for shopping with us.</p>
            </div>
            <div style="background-color: #F8F9FA; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #888;">Order ID:</p>
                <p style="margin: 0; font-weight: bold; color: #202224;">#${orderDetails.id}</p>
            </div>
            <p style="color: #444; line-height: 1.6;">Your order is being processed and will be shipped soon. You can track your order status in your dashboard.</p>
        </div>
            `,
            attachments: [
                {
                    filename: `order_${orderDetails.id}_confirmation.pdf`,
                    content: pdfBuffer,
                },
            ],
        })

    }

    async sendOderInfoToAdmin(adminEmail, user) {
        await this.mailerService.sendMail({
            to: adminEmail,
            subject: 'New Order Placed',
            html: `
            <div style="font-family: sans-serif; border-left: 4px solid #4379EE; padding-left: 20px;">
            <h2 style="color: #202224;">New Order</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #888;">Customer:</td><td style="font-weight: bold;">${user.name}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">User ID:</td><td style="font-family: monospace;">${user.id}</td></tr>
            </table>
        </div>
            `,
        })

    }

    async sendOderInfoToVendor(vendorEmail) {
        await this.mailerService.sendMail({
            to: vendorEmail,
            subject: 'New Oreder Placed',
            html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 12px;">
            <div style="background: #4379EE; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h2 style="margin: 0;">New Order for Your Store!</h2>
            </div>
            <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="color: #444;">Hello,</p>
                <p style="color: #444;">You have received a new order. Please prepare the items for shipment as soon as possible to maintain your vendor rating.</p>
            </div>
        </div>
            `,
        })

    }


}
