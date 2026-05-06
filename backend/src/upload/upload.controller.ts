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

}
