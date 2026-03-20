import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MemberService } from "src/member/member.service";
import { AuthService } from "../auth/auth.service";
import { AdminService } from "./admin.service";

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService, private readonly memberService: MemberService,) { }
    @Get('users')
    getAllUsers() {
        return this.adminService.findAllUsers()
    }

    @Delete(':id')
    deleteUser(@Param() body: any) {
        return this.adminService.deletUser(body.id)
    }

    @Post('members')
    async addMember(@Body() body: { name: string; designation: string }) {
        return await this.memberService.createMember(body.name, body.designation);
    }

    @Get('members')
    async listMembers() {
        return await this.memberService.getAllMembers();
    }

    @Patch('edit')
    async editUserInfo(@Body() body:any){
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

}