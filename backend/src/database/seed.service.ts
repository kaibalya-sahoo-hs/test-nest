// src/database/seed.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/users.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
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
}
