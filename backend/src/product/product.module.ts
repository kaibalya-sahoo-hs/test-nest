import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/upload/upload.module';
import { Product } from './product.entity';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CloudinaryModule],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
