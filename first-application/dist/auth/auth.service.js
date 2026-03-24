"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_entity_1 = require("src/users/users.entity");
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const typeorm_2 = require("@nestjs/typeorm");
const member_entity_1 = require("src/member/member.entity");
const uuid_1 = require("uuid");
const mail_service_1 = require("src/mail/mail.service");
let AuthService = class AuthService {
    userRepo;
    memberRepo;
    JwtService;
    mailService;
    constructor(userRepo, memberRepo, JwtService, mailService) {
        this.userRepo = userRepo;
        this.memberRepo = memberRepo;
        this.JwtService = JwtService;
        this.mailService = mailService;
    }
    async instializeRegistration({ name, email }) {
        try {
            console.log("Trigreed");
            const existingUser = await this.userRepo.findOneBy({ email });
            if (existingUser) {
                return { message: "User already exist", success: false };
            }
            const randomToken = (0, uuid_1.v4)();
            console.log("Random Token", randomToken);
            const user = this.userRepo.create({ name, email, registartionToken: randomToken });
            const mailResposne = await this.mailService.sendMail(user.email, user.name, user.registartionToken);
            if (mailResposne.success) {
                const savedUser = await this.userRepo.save(user);
                console.log("Saved user - ", savedUser);
                return { message: "Email sent successfully", success: true };
            }
            else {
                return { message: "Error while sending the mail", success: false };
            }
        }
        catch (error) {
            console.log("Error while intializing registration", error);
            return { message: "Error while instailizing Resgistartion", success: false };
        }
    }
    async completeRegistartion({ token, password }) {
        console.log(token, password);
        const user = await this.userRepo.findOneBy({ registartionToken: token });
        console.log("User from registartionToken - ", user);
        if (!user) {
            return { message: "Invalid or expired token", success: false };
        }
        const hashedPass = await bcrypt.hash(password, 10);
        user.password = hashedPass;
        user.registartionToken = "";
        await this.userRepo.save(user);
        return { message: "Registration complete! You can now login.", success: true };
    }
    async loginUser({ email, password }) {
        const existingUser = await this.userRepo.findOneBy({ email });
        if (!existingUser) {
            return { message: "User doesnot exist", success: false };
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return { message: "Wrong Password", success: false };
        }
        const token = await this.JwtService.signAsync({ user: existingUser.id, email: existingUser.email, name: existingUser.name });
        return {
            mesage: "Login successful",
            user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, profile: existingUser.profile },
            token,
            success: true
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(users_entity_1.User)),
    __param(1, (0, typeorm_2.InjectRepository)(member_entity_1.Member)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_1.Repository !== "undefined" && typeorm_1.Repository) === "function" ? _b : Object, typeof (_c = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _c : Object, typeof (_d = typeof mail_service_1.MailService !== "undefined" && mail_service_1.MailService) === "function" ? _d : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map