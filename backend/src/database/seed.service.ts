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

  async seedProducts () {

  const vendor = await this.userRepo.findOne({ where: { role: 'vendor' } });
  if (!vendor) {
    console.error('Seed failed: No vendor user found. Create a user first!');
    return;
  }

  
  const tags = await this.tagRepo.save([
    { name: 'Electronics' },
    { name: 'Fashion' },
    { name: 'Summer' },
    { name: 'Essentials' },
  ]);
  
  const productsData = [
    {
      name: 'Premium Cotton T-Shirt',
      description: 'A high-quality, breathable cotton t-shirt perfect for summer.',
      category: 'Clothing',
      rating: 4.5,
      features: ['100% Organic Cotton', 'Pre-shrunk', 'Breathable fabric'],
      vendor: vendor,
      tags: [tags[1], tags[2]],
      variants: [
        {
          color: 'Red',
          size: 'M',
          price: 25.00,
          stock: 50,
          image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1778493660/c12b8375da2b0d53d0cc84f128626ef0a8b04b87_fe7034.jpg',
          images: ['https://res.cloudinary.com/dtwulja9k/image/upload/v1778493660/c12b8375da2b0d53d0cc84f128626ef0a8b04b87_fe7034.jpg'],
          imageUploadStatus: 'completed',
        },
        {
          color: 'Blue',
          size: 'L',
          price: 27.00,
          stock: 30,
          image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1778493681/HoldernessBourne698e0443099c14698e044309ca9.11655941698e044309ca9_vgx04e.png',
          images: ['https://res.cloudinary.com/dtwulja9k/image/upload/v1778493681/HoldernessBourne698e0443099c14698e044309ca9.11655941698e044309ca9_vgx04e.png'],
          imageUploadStatus: 'completed',
        },
      ],
    },
    {
      name: 'Noise Cancelling Headphones',
      description: 'Experience pure sound with our latest wireless headphones.',
      category: 'Electronics',
      rating: 4.8,
      features: ['Active Noise Cancelling', '40h Battery Life', 'Bluetooth 5.0'],
      vendor: vendor,
      tags: [tags[0], tags[3]],
      variants: [
        {
          color: 'Black',
          size: 'One Size',
          price: 199,
          stock: 15,
          image: 'https://res.cloudinary.com/dtwulja9k/image/upload/v1777886626/0081006114507_csvd7u.jpg',
          images: ['https://res.cloudinary.com/dtwulja9k/image/upload/v1777886626/0081006114507_csvd7u.jpg'],
          imageUploadStatus: 'completed',
        },
      ],
    },
  ];

  for (const item of productsData) {
    const product = this.productRepo.create(item);
    await this.productRepo.save(product);
  }

  console.log('Product Seeding successful!');
};
}
