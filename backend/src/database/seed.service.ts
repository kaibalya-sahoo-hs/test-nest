// src/database/seed.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';
import { Product } from 'src/product/product.entity';
import { Tag } from 'src/product/tag.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>
  ) { }

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedUsers()
    await this.seedProducts()
  }

  async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const adminExists = await this.userRepo.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      let hashedPassword;

      if (adminPassword) {
        hashedPassword = await bcrypt.hash(adminPassword, 10);
      }

      const admin = this.userRepo.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await this.userRepo.save(admin);
      console.log('✅ Default admin created successfully.');
    }
  }

  async seedUsers() {

    const usersCount = await this.userRepo.count()

    if(usersCount>1){
      return;
    }
    const password = await bcrypt.hash('123456', 10);

    // 👤 Normal Users
    const users = [
      this.userRepo.create({
        name: 'John Doe',
        email: 'john@example.com',
        password,
        role: 'member',
      }),
      this.userRepo.create({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password,
        role: 'member',
      }),
    ];

    // 🏪 Vendors
    const vendors = [
      this.userRepo.create({
        name: 'Vendor One',
        email: 'vendor1@example.com',
        password,
        role: 'vendor',
        storeName: 'Tech World',
        storeDescription: 'Electronics and gadgets',
        vendorStatus: 'approved',
        commisionRate: 0.1,
      }),
      this.userRepo.create({
        name: 'Vendor Two',
        email: 'vendor2@example.com',
        password,
        role: 'vendor',
        storeName: 'Book Haven',
        storeDescription: 'Books and stationery',
        vendorStatus: 'approved',
        commisionRate: 0.12,
      }),
      this.userRepo.create({
        name: 'Vendor Three',
        email: 'vendor3@example.com',
        password,
        role: 'vendor',
        storeName: 'Fashion Hub',
        storeDescription: 'Clothing and accessories',
        vendorStatus: 'pending',
        commisionRate: 0.15,
      }),
    ];

    await this.userRepo.save([...users, ...vendors]);

    console.log('✅ Users & Vendors seeded');
  }

  async seedProducts() {
    const productCount = await this.productRepo.count()
    if(productCount > 0){
      return
    }
    const vendor = await this.userRepo.findOne({ where: { role: 'vendor' } });
    if (!vendor) {
      console.error('❌ Seed failed: No vendor found in database.');
      return;
    }

    // 2. Create or Find Tags
    // We handle tags first because ManyToMany requires the Tag entity to exist
    const tagNames = ['Electronics', 'Trending', 'New Arrival', 'Fashion', 'Eco-friendly'];
    const savedTags: Tag[] = [];

    for (const name of tagNames) {
      let tag = await this.tagRepo.findOne({ where: { name } });
      if (!tag) {
        tag = await this.tagRepo.save(this.tagRepo.create({ name }));
      }
      savedTags.push(tag);
    }

    // 3. Define Dummy Products
    const dummyData = [
      {
        name: 'Ultra-Bass Wireless Headphones',
        description: 'Experience studio-quality sound with active noise cancellation.',
        price: 8999.00,
        stock: 25,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        tagIndices: [0, 1], // Electronics, Trending
      },
      {
        name: 'Minimalist Leather Watch',
        description: 'Genuine leather strap with a scratch-resistant glass face.',
        price: 3499.00,
        stock: 15,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        tagIndices: [2, 3], // New Arrival, Fashion
      },
      {
        name: 'Smart Coffee Mug',
        description: 'Keeps your drink at the perfect temperature for 3 hours.',
        price: 1200.00,
        stock: 50,
        category: 'Home Appliences',
        image: 'https://images.unsplash.com/photo-1517256673644-36ad11246d21',
        tagIndices: [0, 4], // Electronics, Eco-friendly
      },
    ];

    console.log('🌱 Seeding Products...');

    for (const data of dummyData) {
      const product = this.productRepo.create({
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        image: data.image,
        vendor: vendor,
        // Map indices to actual saved tag entities
        tags: data.tagIndices.map(index => savedTags[index]),
        images: [data.image], // Matching your simple-json column
        rating: 4.5,
      });

      await this.productRepo.save(product);
    }

    console.log('✅ Seeding Complete!');
  }
}
