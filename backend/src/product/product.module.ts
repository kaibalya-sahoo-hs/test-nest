import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryModule } from 'src/upload/upload.module';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { Tag } from './tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Tag]), CloudinaryModule, EmbeddingModule],
  providers: [ProductService],
  exports: [ProductService],
  controllers: [ProductController]
})
export class ProductModule {}
