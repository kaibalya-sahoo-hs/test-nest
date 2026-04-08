import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiLog } from 'src/api-logs/api-logs.entity';
import { ApiLogsModule } from 'src/api-logs/api-logs.module';
import { LoggerMiddleware } from 'src/common/middlewares/logger.middleware';
import { MailModule } from 'src/mail/mail.module';
import { Member } from 'src/member/member.entity';
import { MembersModule } from 'src/member/member.module';
import { MemberService } from 'src/member/member.service';
import { CloudinaryModule } from 'src/upload/upload.module';
import { User } from 'src/users/users.entity';
import { UsersModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BullModule } from '@nestjs/bull';
import { ProcesUser } from './admin.processes';
import { ProductModule } from 'src/product/product.module';
import { Product } from 'src/product/product.entity';
import { CouponModule } from 'src/coupon/coupon.module';
import { PaymentModule } from 'src/payment/payment.module';
import { Vendor } from 'src/vendor/vendor.entity';
import { Order } from 'src/payment/order.entity';


@Module({
    imports: [
        TypeOrmModule.forFeature([User, Member, ApiLog, Product, Vendor, Order]),
        BullModule.registerQueue({name: 'user'}),
        ProductModule,
        UsersModule ,
        MembersModule, 
        CloudinaryModule, 
        MailModule, 
        CouponModule,
        PaymentModule,
        ApiLogsModule],
    providers: [AdminService, ProcesUser],
    controllers: [AdminController],
    exports: [AdminService]
})
export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(LoggerMiddleware)
            .forRoutes('*'); // Log everything, or specify routes
    }
}

