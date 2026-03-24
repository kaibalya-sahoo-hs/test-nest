"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./users/users.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const jwt_1 = require("@nestjs/jwt");
const mail_module_1 = require("./mail/mail.module");
const upload_service_1 = require("./upload/upload.service");
const upload_module_1 = require("./upload/upload.module");
const admin_controller_1 = require("./admin/admin.controller");
const admin_module_1 = require("./admin/admin.module");
const member_module_1 = require("./member/member.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: '60s' },
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: 'localhost',
                port: 5432,
                username: 'postgres',
                password: process.env.DB_PASS,
                database: process.env.DB_NAME,
                autoLoadEntities: true,
                synchronize: true,
            }),
            users_module_1.UsersModule,
            member_module_1.MembersModule,
            auth_module_1.AuthModule,
            mail_module_1.MailModule,
            upload_module_1.CloudinaryModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController, app_controller_1.TestController, admin_controller_1.AdminController],
        providers: [app_service_1.AppService, upload_service_1.CloudinaryService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map