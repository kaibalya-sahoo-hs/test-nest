import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { Brackets, Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { relative } from 'node:path';

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
    const product = await this.productRepo.findOne({ where: { id }, relations: ['vendor'] });
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

    if (!product) {
      throw new NotFoundException('Product not found')
    }
    let keyWords = product?.tags
      .map(tag => tag.name.trim().toLowerCase())
      .filter(Boolean)
      .join(' | ');

    const resultMap = new Map<string, any>();
    const limit = 8;

    // 1. PRIMARY: Tag-based matching via full-text search
    if (keyWords) {
      try {
        const tagMatches = await this.productRepo.query(`
          SELECT DISTINCT p.*
          FROM products p
          JOIN product_tags pt ON pt."productsId" = p.id
          JOIN tags t ON t.id = pt."tagsId"
          WHERE to_tsvector(t.name)
          @@ plainto_tsquery($1)
          AND p.id != $2
          LIMIT $3
        `, [keyWords, productId, limit]);

        tagMatches.forEach(p => resultMap.set(p.id, p));
      } catch (e) {
        console.error('Tag matching error:', e);
      }
    }

    // 2. SECONDARY: Description-based keyword matching
    if (resultMap.size < limit && product.description) {
      const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'been', 'will', 'have', 'has', 'can', 'our', 'your'];
      const descKeywords = product.description
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word.toLowerCase()))
        .slice(0, 6); // Use top 6 meaningful words

      if (descKeywords.length > 0) {
        const existingIds = [productId, ...Array.from(resultMap.keys())];
        try {
          const descMatches = await this.productRepo.createQueryBuilder('product')
            .where('product.id NOT IN (:...ids)', { ids: existingIds })
            .andWhere(new Brackets(qb => {
              descKeywords.forEach((word, index) => {
                const param = `desc_${index}`;
                qb.orWhere(`product.description ILIKE :${param}`, { [param]: `%${word}%` });
              });
            }))
            .take(limit - resultMap.size)
            .getMany();

          descMatches.forEach(p => resultMap.set(p.id, p));
        } catch (e) {
          console.error('Description matching error:', e);
        }
      }
    }

    // 3. TERTIARY: Name-based keyword matching
    if (resultMap.size < limit) {
      const results = await this.getRelatedProducts(product, Array.from(resultMap.keys()), limit - resultMap.size);
      results.forEach(p => resultMap.set(p.id, p));
    }

    return { success: true, products: Array.from(resultMap.values()).slice(0, limit) }
  }

  async getRelatedProducts(product: Product, excludeIds: string[] = [], limit: number = 4) {
    // 1. CLEAN KEYWORDS
    const cleanName = product.name.replace(/[^\w\s]/gi, '');
    const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'with'];
    const keywords = cleanName
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()));

    const allExcludeIds = [product.id, ...excludeIds];

    // 2. PRIMARY SEARCH (Keyword Match)
    let related: Product[] = [];
    if (keywords.length > 0) {
      related = await this.productRepo.createQueryBuilder('product')
        .where('product.id NOT IN (:...ids)', { ids: allExcludeIds })
        .andWhere(new Brackets(qb => {
          keywords.forEach((word, index) => {
            const param = `word_${index}`;
            qb.orWhere(`product.name ILIKE :${param}`, { [param]: `%${word}%` });
          });
        }))
        .take(limit)
        .getMany();
    }

    // 3. FALLBACK (fill with random products)
    if (related.length < limit) {
      const existingIds = [...allExcludeIds, ...related.map(p => p.id)];
      
      const additionalProducts = await this.productRepo.createQueryBuilder('product')
        .where('product.id NOT IN (:...ids)', { ids: existingIds })
        .orderBy('RANDOM()') 
        .take(limit - related.length)
        .getMany();

      related = [...related, ...additionalProducts];
    }

    return related;
  }

}
