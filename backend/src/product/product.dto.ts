// create-product.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayMaxSize,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  color: string
  
  @IsOptional()
  size: string

  @IsOptional()
  stock: number

  @IsOptional()
  tags: string

  @IsString()
  features: string
}