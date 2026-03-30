import { Process, Processor, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Parser } from 'json2csv'
import { Job } from 'bullmq'
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';


@Processor('user')
export class ProcesUser {
    constructor(@InjectRepository(User) private userRepo: Repository<User>, private mailService:MailService) { }
    @Process('process-job')
    async handleBulkUsers(job: Job) { // This should show up now
        const reportData: any = [];
        const { users, adminEmail } = job.data;

        for (const user of users) {
            try {
                const exists = await this.userRepo.findOne({ where: { email: user.email } });
                if (exists) {
                    reportData.push({ ...user, result: 'User already exists' });
                } else {
                    // Note: check your spelling of 'password' in the CSV vs your code
                    const hashedPass = await bcrypt.hash(user.password || 'default123', 10);
                    const newUser = this.userRepo.create({ ...user, password: hashedPass });
                    await this.userRepo.save(newUser);
                    reportData.push({ ...user, result: 'user created successfully' });
                }
            } catch (error) {
                console.log("Inner Error:", error);
                reportData.push({ ...user, result: `Error ${error.message}` });
            }

            const progress = (reportData.length / users.length) * 100;
        }

        const json2csvParser = new Parser();
        const csvReport = json2csvParser.parse(reportData);
        console.log(csvReport)
        const fileName = `report-${job.id}-${Date.now()}.csv`;
        const relativePath = `/reports/${fileName}`;
        const fullPath = path.join(__dirname, '..', '..', 'public', relativePath);

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, csvReport);
        
        const result = await this.mailService.sendCSVReport(adminEmail, csvReport, job.id || "")

        if(result){
            console.log("Report sent ")
            return { csvReport, reportData };
        }

        console.log("Error in the process")


    }
    @OnQueueCompleted()
    async onCompleted(job: Job, result: any) {
        console.log(`Job ${job.id} finished! Report is at: ${result.reportPath}`);
        // You could trigger a WebSocket push to the user here
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: Error) {
        console.error(`Job ${job.id} failed with error: ${err.message}`);
    }
}