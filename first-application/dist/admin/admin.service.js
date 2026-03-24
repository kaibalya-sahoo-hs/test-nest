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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const upload_service_1 = require("src/upload/upload.service");
const users_entity_1 = require("src/users/users.entity");
const typeorm_2 = require("typeorm");
let AdminService = class AdminService {
    userRepo;
    cloudinaryService;
    constructor(userRepo, cloudinaryService) {
        this.userRepo = userRepo;
        this.cloudinaryService = cloudinaryService;
    }
    deletUser(id) {
        const user = this.userRepo.delete(id);
        return user;
    }
    findAllUsers() {
        return this.userRepo.find();
    }
    deletAllUsers() {
        return this.userRepo.deleteAll();
    }
    async saveImage(id, file) {
        try {
            const result = await this.cloudinaryService.uploadImage(file);
            const user = await this.userRepo.findOneBy({ id });
            console.log("User : ", user);
            if (user && result && result.url) {
                user.profile = result.url;
                await this.userRepo.save(user);
                return { success: true, url: result && result.url };
            }
            return { success: false, message: "Error while saving the image" };
        }
        catch (error) {
            console.log("Error while uplaoding the image", error);
            return { message: "Error while uplaoding the image", success: false };
        }
    }
    async editUserInfo(body) {
        try {
            await this.userRepo.update(body.id, body.updatedCredentials);
            return { success: true, message: "Updated successfully" };
        }
        catch (error) {
            console.log("error while updateing user", error);
            return { success: false, message: "Error while updating" };
        }
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof upload_service_1.CloudinaryService !== "undefined" && upload_service_1.CloudinaryService) === "function" ? _b : Object])
], AdminService);
//# sourceMappingURL=admin.service.js.map