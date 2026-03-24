"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const mail_service_1 = require("src/mail/mail.service");
const member_service_1 = require("src/member/member.service");
const users_service_1 = require("src/users/users.service");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    adminService;
    memberService;
    userSevice;
    mailService;
    constructor(adminService, memberService, userSevice, mailService) {
        this.adminService = adminService;
        this.memberService = memberService;
        this.userSevice = userSevice;
        this.mailService = mailService;
    }
    getAllUsers() {
        return this.adminService.findAllUsers();
    }
    deleteUser(body) {
        return this.adminService.deletUser(body.id);
    }
    async addMember(body) {
        return await this.memberService.createMember(body.name, body.email, body.password);
    }
    async editUserInfo(body) {
        const res = await this.adminService.editUserInfo(body);
        return res;
    }
    async removeMember(id) {
        return await this.memberService.deleteMember(id);
    }
    async uploadProfile(file, body) {
        console.log("File:", file);
        console.log("Body: ", body);
        return this.adminService.saveImage(body.id, file);
    }
    async sendmail(body) {
        const { name, email, registartionToken } = body;
        const result = await this.mailService.sendMail(email, name, registartionToken);
        if (!result) {
            return { "message": "Error while sending mail", success: false };
        }
        return { message: `Email sent to the user ${name}`, success: true };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('member'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "addMember", null);
__decorate([
    (0, common_1.Patch)('edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "editUserInfo", null);
__decorate([
    (0, common_1.Delete)('members/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)('uploadProfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof Express !== "undefined" && (_e = Express.Multer) !== void 0 && _e.File) === "function" ? _f : Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadProfile", null);
__decorate([
    (0, common_1.Post)('send-mail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "sendmail", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [typeof (_a = typeof admin_service_1.AdminService !== "undefined" && admin_service_1.AdminService) === "function" ? _a : Object, typeof (_b = typeof member_service_1.MemberService !== "undefined" && member_service_1.MemberService) === "function" ? _b : Object, typeof (_c = typeof users_service_1.UserService !== "undefined" && users_service_1.UserService) === "function" ? _c : Object, typeof (_d = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _d : Object])
], AdminController);
//# sourceMappingURL=admin.controller.js.map