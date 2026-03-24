import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiLogsService } from "src/api-logs/api-logs.service";
import { MailService } from "src/mail/mail.service";
import { MemberService } from "src/member/member.service";
import { UserService } from "src/users/users.service";
import { AuthService } from "../auth/auth.service";
import { AdminService } from "./admin.service";

@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService, 
        private readonly memberService: MemberService, 
        private userSevice: UserService, 
        private mailService: MailService,
        private apiLogService: ApiLogsService
        ) { }
    @Get('users')
    getAllUsers() {
        return this.adminService.findAllUsers()
    }

    @Delete(':id')
    deleteUser(@Param() body: any) {
        return this.adminService.deletUser(body.id)
    }

    @Post('member')
    async addMember(@Body() body: { name: string; email: string; password: string }) {
        return await this.memberService.createMember(body.name, body.email, body.password);
    }

    @Patch('edit')
    async editUserInfo(@Body() body: any) {
        const res = await this.adminService.editUserInfo(body)
        return res
    }

    @Delete('members/:id')
    async removeMember(@Param('id', ParseIntPipe) id: number) {
        return await this.memberService.deleteMember(id);
    }

    @Post('uploadProfile')
    @UseInterceptors(FileInterceptor('file'))
    async uploadProfile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
        console.log("File:", file)
        console.log("Body: ", body)
        return this.adminService.saveImage(body.id, file)
    }

    @Post('send-mail')
    async sendmail(@Body() body: any) {
        const { name, email, registartionToken } = body
        const result = await this.mailService.sendMail(email, name, registartionToken)
        if (!result) {
            return { "message": "Error while sending mail", success: false }
        }
        return { message: `Email sent to the user ${name}`, success: true }
    }

    @Get('apilogs')
    async getApiLogs() {
        return this.apiLogService.getAllLogs()
    }

}