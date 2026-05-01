import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/upload/upload.module';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { Tag } from './tag.entity';
import { ReviewModule } from 'src/review/review.module';
import { User } from 'src/users/users.entity';
import { Order } from 'src/payment/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Tag, User, Order]), CloudinaryModule, ReviewModule],
  providers: [ProductService],
  exports: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
