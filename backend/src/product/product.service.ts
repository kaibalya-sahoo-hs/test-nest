import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { Brackets, ILike, Like, Repository } from 'typeorm';
import { Product } from './product.entity';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { relative } from 'node:path';
import { User } from 'src/users/users.entity';
import { Order } from 'src/payment/order.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private cloudinaryService: CloudinaryService,
  ) { }

  // Create a new product
  async create(
    productData,
    file: Express.Multer.File,
  ): Promise<Product> {
    const result = await this.cloudinaryService.uploadImage(file);

    const featuresArray = productData.features.split(",")
    const newProduct: any = this.productRepo.create({ ...productData, features: featuresArray });

    if (result?.url) {
      newProduct.image = result?.url;
    }
    return await this.productRepo.save(newProduct);
  }

  // Get all products (with optional pagination)
  async findAll(): Promise<Product[]> {
    return await this.productRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['vendor', 'variants'] // Show newest first
    });
  }

  async getProductVariants(productId: string) {
    const product = await this.productRepo.findOne({ where: { id: productId }, relations: ['variants'] });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    return {variants: product.variants || []};
  }

  // Find one by ID
  async findOne(title: string, vendor): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { name: title, vendor: { name: vendor } }, relations: ['vendor', 'reviews', 'tags', 'variants'] });
    if (!product)
      throw new NotFoundException(`Product not found`);
    return product;
  }

  // Search products by name and description for the public search bar
  async searchProducts(query: string) {
    try {
      const trimmed = query.trim();
      if (!trimmed) {
        // Return all products if empty search
        const products = await this.productRepo.find({
          order: { createdAt: 'DESC' },
          relations: ['vendor'],
        });
        return { success: true, products, query: '' };
      }

      const products = await this.productRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.vendor', 'vendor')
        .leftJoinAndSelect('p.tags', 'tags')
        .where('p.name ILIKE :q', { q: `%${trimmed}%` })
        .orWhere('p.description ILIKE :q', { q: `%${trimmed}%` })
        .orWhere('tags.name ILIKE :q', { q: `%${trimmed}%` })
        .orderBy('p.createdAt', 'DESC')
        .getMany();

      return { success: true, products, query: trimmed };
    } catch (error) {
      console.error('Search error:', error);
      return { success: false, products: [], query, message: 'Search failed' };
    }
  }

  async getProductsByName(name: string) {
    try {
      const products = await this.productRepo.find({
        where: { name: ILike(`%${name}%`) },
        relations: ['vendor'],
      });
      const result = products.map((p) => {
        return {
          vendorName: p.vendor.name,
          productName: p.name,
          productImage: p.variants[0]?.image 
        }
      })
      return result;
    } catch (error) {
      console.log('Error while searching ', error);
      return { message: 'Error while searching', success: false };
    }
  }

  async getProducts(
    filters: {
      name?: string,
      minAmount?: number,
      maxAmount?: number,
      features?: string[]
    }
  ) {
    try {
      let qb = await this.productRepo.createQueryBuilder('product')
        .leftJoinAndSelect('product.vendor', 'vendor')
        .leftJoinAndSelect('product.variants', 'variants');

      if (filters.name) {
        console.log(filters.name)
        qb.andWhere('product.name ILIKE :name', { name: `%${filters.name}%` })
      }


      if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
        qb.andWhere('variants.price <= :maxPrice', { maxPrice: filters.maxAmount });
      }

      if (filters.minAmount !== undefined && filters.minAmount !== null) {
        qb.andWhere('variants.price >= :minPrice', { minPrice: filters.minAmount });
      }

      if (filters.features && filters.features.length > 0) {
        filters.features.forEach((word, index) => {
          const paramName = `featureWord${index}`;
          qb.andWhere(
            `EXISTS (
              SELECT 1 FROM unnest(product.features) as feature 
              WHERE feature ILIKE :${paramName}
      )`,
            { [paramName]: `%${word}%` }
          );
        });
      }

      return qb.getMany()
    } catch (error) {
      console.log('Error while searching ', error);
      return { message: 'Error while searching', success: false };
    }
  }

  async getTopVendorsByProductName(filters?: { productName?: string; limit?: number }) {
    try {
      const name = (filters?.productName || '').trim();
      if (!name) return [];

      const vendorLimit = Math.max(1, Math.min(filters?.limit ?? 5, 50));
      const searchParam = `%${name.toLowerCase()}%`;

      const vendors = await this.userRepo.createQueryBuilder('vendor')
        .innerJoinAndSelect('vendor.products', 'product')
        .where('LOWER(product.name) LIKE :name', { name: searchParam })
        .limit(filters?.limit ?? 5)
        .getMany()

      if (vendors.length === 0) return [];

      const searchLower = name.toLowerCase();

      const finalReport = await Promise.all(vendors.map(async (vendor) => {
        const orderCount = await this.orderRepo.count({
          where: { vendor: { id: vendor.id } },
        });

        const matchedProducts = (vendor.products || [])
          .filter(p => p.name && p.name.toLowerCase().includes(searchLower))
          .slice(0, 4)
          .map(p => ({ id: p.id, name: p.name, image:p.variants[0].image }));

        return {
          vendorId: vendor.id,
          vendorName: vendor.name,
          totalOrders: orderCount,
          products: matchedProducts,
        };
      }));

      console.log(finalReport)
      return finalReport
        .sort((a, b) => b.totalOrders - a.totalOrders)
    } catch (error) {
      console.error('getTopVendorsByProductName error:', error);
      return [];
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
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException("Product not found")
    }
    await this.productRepo.remove(product);
    return { deleted: true };
  }



  async getSimilarSuggestions(productName: string) {
    const product = await this.productRepo.findOne({ where: { name: productName }, relations: ['tags', 'vendor', 'variants'] })

    if (!product) {
      throw new NotFoundException('Product not found')
    }
    let keyWords = product?.tags
      .map(tag => tag.name.trim().toLowerCase())
      .filter(Boolean)
      .join(' | ');

    const resultMap = new Map<string, any>();
    const limit = 4;

    // 1. PRIMARY: Tag-based matching
    try {
      const tagMatches = await this.productRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.tags', 'tags')
        .leftJoinAndSelect('p.vendor', 'vendor')
        .leftJoinAndSelect('p.variants', 'variants')
        .where('p.id != :productId', { productId: product.id })
        .andWhere('tags.name ILIKE :keyword', { keyword: `%${keyWords}%` })
        .take(limit)
        .getMany();

      tagMatches.forEach(p => resultMap.set(p.id, p));
    } catch (e) {
      console.error('Tag matching error:', e);
    }

    // 2. SECONDARY: Description-based keyword matching
    if (resultMap.size < limit && product.description) {
      const stopWords = ['the', 'and', 'for', 'with', 'from', 'this', 'that', 'are', 'was', 'been', 'will', 'have', 'has', 'can', 'our', 'your'];
      const descKeywords = product.description
        .replace(/[^\w\s]/gi, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.includes(word.toLowerCase()))
        .slice(0, 6);

      if (descKeywords.length > 0) {
        const existingIds = [product.id, ...Array.from(resultMap.keys())];
        try {
          const descMatches = await this.productRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.vendor', 'vendor')
            .leftJoinAndSelect('p.variants', 'variants')
            .where('p.id NOT IN (:...ids)', { ids: existingIds })
            .andWhere(new Brackets(qb => {
              descKeywords.forEach((word, index) => {
                const param = `desc_${index}`;
                qb.orWhere(`p.description ILIKE :${param}`, { [param]: `%${word}%` });
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
      related = await this.productRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.vendor', 'vendor')
        .leftJoinAndSelect('p.variants', 'variants')
        .where('p.id NOT IN (:...ids)', { ids: allExcludeIds })
        .andWhere(new Brackets(qb => {
          keywords.forEach((word, index) => {
            const param = `word_${index}`;
            qb.orWhere(`p.name ILIKE :${param}`, { [param]: `%${word}%` });
          });
        }))
        .take(limit)
        .getMany();
    }

    // 3. FALLBACK (fill with remaining products)
    if (related.length < limit) {
      const existingIds = [...allExcludeIds, ...related.map(p => p.id)];

      const additionalProducts = await this.productRepo.createQueryBuilder('p')
        .leftJoinAndSelect('p.vendor', 'vendor')
        .leftJoinAndSelect('p.variants', 'variants')
        .where('p.id NOT IN (:...ids)', { ids: existingIds })
        .take(limit - related.length)
        .getMany();

      related = [...related, ...additionalProducts];
    }

    return related;
  }

}
