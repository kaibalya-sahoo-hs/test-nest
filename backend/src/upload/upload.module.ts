import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from './uplaod.provider';
import { CloudinaryService } from './upload.service';
import { ImageUploadProcessor } from './image-upload.processor';
import { UploadController } from './upload.controller';
import { Product } from '../product/product.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'image-upload' }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [UploadController],
  providers: [CloudinaryProvider, CloudinaryService, ImageUploadProcessor],
  exports: [CloudinaryProvider, CloudinaryService, BullModule],
})
export class CloudinaryModule {}