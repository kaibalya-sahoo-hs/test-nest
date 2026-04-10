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
        console.log("Enterd vendor mail process")
        const { vendorMail } = job.data
        await this.mailService.sendOderInfoToVendor(vendorMail)
    }

    @Process('admin-mail')
    async handleAdminMail(job) {
        console.log("Enterd admin mail process")

        const { user, adminMail } = job.data
        await this.mailService.sendOderInfoToAdmin(adminMail, user)
    }

    @Process('user-mail')
    async handleOrderConfirmationMail(job) {
        console.log("Enterd user mail process")

        const { user, orderDetails } = job.data
        await this.mailService.sendOrderConfirmationMail(user.email, orderDetails)
    }

}