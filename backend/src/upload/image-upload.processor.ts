import { Process, Processor } from '@nestjs/bull';
import * as Bull from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { CloudinaryService } from './upload.service';
import { ProductVariant } from 'src/product/productVariant.entity';

@Processor('image-upload')
export class ImageUploadProcessor {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private productVariantRepo: Repository<ProductVariant>,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Process('upload-product-images')
  async handleUpload(job: Bull.Job) {
    const { productId, productVariantId, files } = job.data;

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
      const productVariant = await this.productVariantRepo.findOne({ where: { id: productVariantId } });
      console.log('productvariant', productVariant )
      if (productVariant) {
        // Merge with any existing images (in case of updates)
        const existingImages = productVariant.images || [];
        const allImages = [...existingImages, ...imageUrls];

        productVariant.images = allImages;
        productVariant.image = allImages[0] || productVariant.image || '';
        productVariant.imageUploadStatus = 'completed';
        await this.productVariantRepo.save(productVariant);
      }

      return { success: true, imageUrls };
    } catch (error) {
      console.error('Image upload queue error:', error);

      // Mark the product as failed
      try {
        const productVariant = await this.productVariantRepo.findOne({ where: { id: productVariantId } });
        if (productVariant) {
          productVariant.imageUploadStatus = 'failed';
          await this.productVariantRepo.save(productVariant);
        }
      } catch (e) {
        console.error('Failed to update product status:', e);
      }

      throw error;
    }
  }
}
