import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';

@Controller('upload')
export class UploadController {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  @Get('status/:productId')
  async getUploadStatus(@Param('productId') productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      select: ['id', 'imageUploadStatus', 'image', 'images'],
    });

    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    return {
      success: true,
      productId: product.id,
      status: product.imageUploadStatus,
      image: product.image,
      images: product.images,
    };
  }
}
