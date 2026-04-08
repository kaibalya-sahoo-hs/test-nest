import { Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Product } from 'src/product/product.entity';
import { ProductModule } from 'src/product/product.module';
import { ProductService } from 'src/product/product.service';
import { CloudinaryModule } from 'src/upload/upload.module';
import { MailModule } from 'src/mail/mail.module';
import { Order } from 'src/payment/order.entity';
import { Vendor } from './vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Product, Order, Vendor]), ProductModule ,CloudinaryModule, MailModule], 
  controllers: [VendorController],
  providers: [VendorService]
})
export class VendorModule {}
