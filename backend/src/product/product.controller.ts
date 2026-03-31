import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
    constructor(private productService: ProductService){}
    @Get('')
    async getAllProducts() {
        try {
            const products = await this.productService.findAll();

            return {
                success: true,
                count: products.length,
                data: products,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to fetch products',
                error: error.message,
            };
        }
    }

    @Get(':id')
    async getProductById(@Param('id') id: string) {
        const product = await this.productService.findOne(id);

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return {
            success: true,
            product,
        };
    }
}
