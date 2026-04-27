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
        name: 'Admin1',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await this.userRepo.save(admin);
      console.log('Default admin created successfully.');
    }
  }

  async seedUsers() {

    const usersCount = await this.userRepo.count()

    if (usersCount > 1) {
      return;
    }
    const password = await bcrypt.hash('password', 10);

    // 👤 Normal Users
    const users = [
      this.userRepo.create({
        name: 'Admin 2',
        email: 'admin2@gmail.com',
        password: await bcrypt.hash('admin@123', 10),
        role: 'guest',
      }),
      this.userRepo.create({
        name: 'Alice Smith',
        email: 'alice@example.com',
        password,
        role: 'guest',
      }),
      this.userRepo.create({
        name: 'Emily Rose',
        email: 'emily@example.com',
        password,
        role: 'guest',
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

    console.log('Users & Vendors seeded');
  }

  async seedProducts() {
    const productCount = await this.productRepo.count()
    if (productCount > 0) {
      return
    }
    const vendor = await this.userRepo.findOne({ where: { role: 'vendor' } });
    if (!vendor) {
      console.error('Seed failed: No vendor found in database.');
      return;
    }


    const tagNames = [
      'Electronics', 'Trending', 'New Arrival', 'Fashion', 'Eco-friendly',
      'Premium', 'Home-Office', 'Portable', 'Fitness', 'Lifestyle',
      'Gift-Idea', 'Durable'
    ];
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
        description: 'Studio-quality sound with active noise cancellation and 40-hour battery life.',
        price: 8999.00,
        stock: 25,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        tagIndices: [0, 1, 5, 7, 9], // Electronics, Trending, Premium, Portable, Lifestyle
      },
      {
        name: 'Minimalist Leather Watch',
        description: 'Handcrafted genuine leather strap with a scratch-resistant sapphire glass face.',
        price: 3499.00,
        stock: 15,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        tagIndices: [3, 1, 2, 5, 10], // Fashion, Trending, New Arrival, Premium, Gift-Idea
      },
      {
        name: 'Smart Coffee Mug',
        description: 'App-controlled heating keeps your drink at the exact temperature you prefer.',
        price: 1200.00,
        stock: 50,
        category: 'Electronics',
        image: 'https://conceptkart.com/products/nilko-n2-300ml-temperature-control-smart-coffee-mug-with-led-display?srsltid=AfmBOoqSnWX1wHB81Gwm2mfssCeV7gQ5OdJCixE2YuV9_5ibFBsAk1iF',
        tagIndices: [0, 4, 6, 9, 11], // Electronics, Eco-friendly, Home-Office, Lifestyle, Durable
      },
      {
        name: 'Ergonomic Mechanical Keyboard',
        description: 'Backlit RGB keys with silent switches, perfect for developers and gamers.',
        price: 5500.00,
        stock: 20,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
        tagIndices: [0, 6, 5, 1, 11], // Electronics, Home-Office, Premium, Trending, Durable
      },
      {
        name: 'Eco-Friendly Yoga Mat',
        description: 'Non-slip natural rubber mat, biodegradable and free from toxic chemicals.',
        price: 2100.00,
        stock: 40,
        category: 'Fitness',
        image: 'data:image/jpeg;base64,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',
        tagIndices: [8, 4, 9, 11, 2], // Fitness, Eco-friendly, Lifestyle, Durable, New Arrival
      },
      {
        name: 'Vintage Denim Jacket',
        description: 'Classic oversized fit denim jacket with reinforced stitching and metal buttons.',
        price: 4200.00,
        stock: 12,
        category: 'Fashion',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMSFxdEOEASh_9CT8u7q0wdJGkB-1NsacJQw&s',
        tagIndices: [3, 1, 9, 11, 10], // Fashion, Trending, Lifestyle, Durable, Gift-Idea
      },
      {
        name: 'Portable Bluetooth Speaker',
        description: 'Waterproof rugged speaker with 360-degree sound and deep bass.',
        price: 2800.00,
        stock: 30,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1608156639585-b3a032ef9689',
        tagIndices: [0, 7, 1, 9, 11], // Electronics, Portable, Trending, Lifestyle, Durable
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Double-walled vacuum insulated bottle that keeps water cold for 24 hours.',
        price: 950.00,
        stock: 100,
        category: 'Fitness',
        image: 'https://femora.in/products/femora-stainless-steel-water-bottle-fridge-bottle-travel-bottle-1000-ml-with-steel-cap?srsltid=AfmBOorfs34RdWvRjD5bgZvm5KXGL6eTCGglcqlFb-srUjJZRqalVmJl',
        tagIndices: [8, 4, 7, 11, 9], // Fitness, Eco-friendly, Portable, Durable, Lifestyle
      },
      {
        name: 'Organic Cotton Hoodie',
        description: 'Ultra-soft premium hoodie made from 100% sustainable organic cotton.',
        price: 3200.00,
        stock: 25,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
        tagIndices: [3, 4, 5, 2, 9], // Fashion, Eco-friendly, Premium, New Arrival, Lifestyle
      },
      {
        name: 'Smart Home Security Camera',
        description: 'AI-powered motion detection with night vision and cloud storage integration.',
        price: 6500.00,
        stock: 18,
        category: 'Electronics',
        image: 'data:image/jpeg;base64,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',
        tagIndices: [0, 6, 2, 5, 1], // Electronics, Home-Office, New Arrival, Premium, Trending
      },
    ];

    console.log('Seeding Products...');

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

    console.log('Seeding Complete!');
  }
}
