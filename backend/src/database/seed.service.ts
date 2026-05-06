// src/database/seed.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';
import { Product } from 'src/product/product.entity';
import { Tag } from 'src/product/tag.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Tag)
    private tagRepo: Repository<Tag>
  ) { }

  async seedAll() {
    await this.seedAdmin();
    await this.seedUsers()
    await this.seedProducts()
  }

  async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

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

  async seedUsers() {

    const usersCount = await this.userRepo.count()

    if (usersCount > 1) {
      return;
    }
    const password = await bcrypt.hash('password', 10);

    // 👤 Normal Users
    const users = [
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
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777886626/0081006114507_csvd7u.jpg',
        tagIndices: [0, 1, 5, 7, 9],
        features: [
          'Active Noise Cancellation (ANC)',
          '40-Hour Extended Battery Life',
          'High-Fidelity Audio Drivers',
          'Ergonomic Over-Ear Design',
          'Multipoint Bluetooth Pairing'
        ]
      },
      {
        name: 'Minimalist Leather Watch',
        description: 'Handcrafted genuine leather strap with a scratch-resistant sapphire glass face.',
        price: 3499.00,
        stock: 15,
        category: 'Fashion',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777886550/Bulang_and_Sons_strap_guide_Rolex_Datejust_white_01_wtqzg6.jpg',
        tagIndices: [3, 1, 2, 5, 10],
        features: [
          'Genuine Italian Leather Strap',
          'Scratch-Resistant Sapphire Glass',
          'Japanese Quartz Movement',
          'Water Resistant up to 5 ATM',
          'Slim-Profile Stainless Steel Case'
        ]
      },
      {
        name: 'Smart Coffee Mug',
        description: 'App-controlled heating keeps your drink at the exact temperature you prefer.',
        price: 1200.00,
        stock: 50,
        category: 'Electronics',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/f_auto,q_auto/v1777291195/hqrximes99wlt9qyjxqs.jpg',
        tagIndices: [0, 4, 6, 9, 11],
        features: [
          'Smartphone App Control',
          'Precise Temperature Regulation',
          'Built-in Rechargeable Battery',
          'Auto-Sleep Motion Sensors',
          'Easy-to-Clean Ceramic Coating'
        ]
      },
      {
        name: 'Ergonomic Mechanical Keyboard',
        description: 'Backlit RGB keys with silent switches, perfect for developers and gamers.',
        price: 5500.00,
        stock: 20,
        category: 'Electronics',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777886590/k65rgbminilede_kjrcsb.jpg',
        tagIndices: [0, 6, 5, 1, 11],
        features: [
          'Customizable RGB Backlighting',
          'Silent Linear Mechanical Switches',
          'Full N-Key Rollover Support',
          'Detachable USB-C Braided Cable',
          'Programmable Macro Keys'
        ]
      },
      {
        name: 'Eco-Friendly Yoga Mat',
        description: 'Non-slip natural rubber mat, biodegradable and free from toxic chemicals.',
        price: 2100.00,
        stock: 40,
        category: 'Fitness',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777290972/z0pdoquyl8opr2e5aspl.jpg',
        tagIndices: [8, 4, 9, 11, 2],
        features: [
          '100% Biodegradable Natural Rubber',
          'Ultra-Grip Non-Slip Surface',
          'Extra-Thick Cushioning (6mm)',
          'Anti-Microbial Closed-Cell Design',
          'Eco-Friendly & Non-Toxic Materials'
        ]
      },
      {
        name: 'Vintage Denim Jacket',
        description: 'Classic oversized fit denim jacket with reinforced stitching and metal buttons.',
        price: 4200.00,
        stock: 12,
        category: 'Fashion',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777290958/bni6xdx1lbcmgkyyethk.webp',
        tagIndices: [3, 1, 9, 11, 10],
        features: [
          'Heavyweight 12oz Raw Denim',
          'Reinforced Triple-Stitched Seams',
          'Classic Oversized Vintage Fit',
          'Branded Antique Metal Buttons',
          'Four Functional Interior Pockets'
        ]
      },
      {
        name: 'Watch series 4',
        description: 'Waterproof Sleak and Accurate Fitness watch for fitness Freak',
        price: 2800.00,
        stock: 30,
        category: 'Electronics',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1776922191/h5dyhpbzs9mxpoobowkz.webp',
        tagIndices: [0, 7, 1, 9, 11],
        features: [
          '24/7 Heart Rate Monitoring',
          'GPS and Workout Tracking',
          'OLED High-Brightness Display',
          'Swim-Proof Water Resistance',
          'Sleep Cycle Analysis Features'
        ]
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Double-walled vacuum insulated bottle that keeps water cold for 24 hours.',
        price: 950.00,
        stock: 100,
        category: 'Fitness',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/q_auto,f_auto/v1777290932/xbgn0ljhodr6mygabx7q.jpg',
        tagIndices: [8, 4, 7, 11, 9],
        features: [
          'Double-Wall Vacuum Insulation',
          'BPA-Free Food Grade Steel',
          'Leak-Proof Magnetic Cap',
          'Condensation-Free Exterior',
          'Wide Mouth for Ice Cubes'
        ]
      },
      {
        name: 'Organic Cotton Hoodie',
        description: 'Ultra-soft premium hoodie made from 100% sustainable organic cotton.',
        price: 3200.00,
        stock: 25,
        category: 'Fashion',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7',
        tagIndices: [3, 4, 5, 2, 9],
        features: [
          '100% GOTS Certified Organic Cotton',
          'Breathable French Terry Interior',
          'Sustainable Eco-Friendly Dyes',
          'Double-Lined Adjustable Hood',
          'Pre-Shrunk for Consistent Fit'
        ]
      },
      {
        name: 'Smart Home Security Camera',
        description: 'AI-powered motion detection with night vision and cloud storage integration.',
        price: 6500.00,
        stock: 18,
        category: 'Electronics',
        image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777291053/zufuoujptsvgnb2w6yfu.jpg',
        tagIndices: [0, 6, 2, 5, 1],
        features: [
          '1080p Full HD Video Stream',
          'AI Human Motion Detection',
          'Infrared Enhanced Night Vision',
          'Two-Way Audio Communication',
          'AES-128 Encrypted Cloud Storage'
        ]
      }
    ];

    console.log('Seeding Products...');

    for (const data of dummyData) {
      const product = this.productRepo.create({
        name: data.name,
        description: data.description,
        category: data.category,
        vendor: vendor,
        features: data.features,
        // Map indices to actual saved tag entities
        tags: data.tagIndices.map(index => savedTags[index]),
        rating: 4.5,
      });

      await this.productRepo.save(product);
    }

    console.log('Seeding Complete!');
  }
}
