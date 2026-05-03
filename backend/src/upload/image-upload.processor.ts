import { Process, Processor } from '@nestjs/bull';
import * as Bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { CloudinaryService } from './upload.service';

@Processor('image-upload')
export class ImageUploadProcessor {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Process('upload-product-images')
  async handleUpload(job: Bull.Job) {
    const { productId, files } = job.data;

    try {
      const imageUrls: string[] = [];
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const fileData = files[i];
        // Reconstruct the buffer from the serialized array
        const reconstructedFile = {
          buffer: Buffer.from(fileData.buffer),
          originalname: fileData.originalname,
          mimetype: fileData.mimetype,
        } as Express.Multer.File;

        const result = await this.cloudinaryService.uploadImage(reconstructedFile);
        if (result?.url || result?.secure_url) {
          imageUrls.push(result.secure_url || result.url);
        }

        // Report progress
        const progress = Math.round(((i + 1) / total) * 100);
        await job.progress(progress);
      }

      // Update the product with the uploaded images
      const product = await this.productRepo.findOne({ where: { id: productId } });
      if (product) {
        // Merge with any existing images (in case of updates)
        const existingImages = product.images || [];
        const allImages = [...existingImages, ...imageUrls];

        product.images = allImages;
        product.image = allImages[0] || product.image || '';
        product.imageUploadStatus = 'completed';
        await this.productRepo.save(product);
      }

      return { success: true, imageUrls };
    } catch (error) {
      console.error('Image upload queue error:', error);

      // Mark the product as failed
      try {
        const product = await this.productRepo.findOne({ where: { id: productId } });
        if (product) {
          product.imageUploadStatus = 'failed';
          await this.productRepo.save(product);
        }
      } catch (e) {
        console.error('Failed to update product status:', e);
      }

      throw error;
    }
  }
}
