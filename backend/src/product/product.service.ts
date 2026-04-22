import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private embeddingService: EmbeddingService,
    private cloudinaryService: CloudinaryService,
  ) { }

  // Create a new product
  async create(
    productData: Partial<Product>,
    file: Express.Multer.File,
  ): Promise<Product> {
    const result = await this.cloudinaryService.uploadImage(file);
    const newProduct = this.productRepo.create(productData);

    if (result?.url) {
      newProduct.image = result?.url;
    }
    return await this.productRepo.save(newProduct);
  }

  // Get all products (with optional pagination)
  async findAll(): Promise<Product[]> {
    return await this.productRepo.find({
      order: { createdAt: 'DESC' }, // Show newest first
    });
  }

  // Find one by ID
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async getProductsByName(name: string) {
    try {
      const products = await this.productRepo.find({
        where: { name: Like(`%${name}%`) },
      });
      return { products, success: true };
    } catch (error) {
      console.log('Error while searching ', error);
      return { message: 'Error while searching', success: false };
    }
  }

  // Edit / Update product
  async update(id: string, updateData: any, file?: Express.Multer.File) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file);
      updateData.image = upload?.secure_url;
    }
    Object.assign(product, updateData);
    return await this.productRepo.save(product);
  }

  // Delete product
  async remove(id: string): Promise<{ deleted: boolean }> {
    const product = await this.findOne(id);
    await this.productRepo.remove(product);
    return { deleted: true };
  }

  async getSimilarSuggestions(productId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId }, relations: ['tags'] })

    let keyWords = product?.tags
      .map(tag => tag.name.trim().toLowerCase())
      .filter(Boolean)
      .join(' | ');


    const products = await this.productRepo.query(`
          SELECT DISTINCT p.*
          FROM products p
          JOIN product_tags pt ON pt."productsId" = p.id
          JOIN tags t ON t.id = pt."tagsId"
          WHERE to_tsvector(t.name)
          @@ to_tsquery($1)
          AND p.id != $2
      `, [keyWords, productId])

    return { success: true, products }
  }

}
