import { Process, Processor } from "@nestjs/bull";
import { Job } from "bullmq";
import { MailService } from "./mail.service";

@Processor('mail-queue')
export class MailProcessor {
    constructor(
        private mailService: MailService
    ) { }
    @Process('vendor-mail')
    async handleVendorMail(job) {
        const { vendorMail } = job.data
        await this.mailService.sendOderInfoToVendor(vendorMail)
    }

    @Process('admin-mail')
    async handleAdminMail(job) {

        const { user, adminMail } = job.data
        await this.mailService.sendOderInfoToAdmin(adminMail, user)
    }

    @Process('user-mail')
    async handleOrderConfirmationMail(job) {

        const { user, orderDetails } = job.data
        await this.mailService.sendOrderConfirmationMail(user.email, orderDetails)
    }

    @Process('registration-mail')
    async sendRegistrationMail(job) {
        console.log("Registration mail added to queue")
        const {email, name, token} = job.data
        await this.mailService.sendMail(email, name, token)
    }

}