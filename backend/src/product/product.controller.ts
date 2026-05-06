import { Controller, Get, NotFoundException, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ReviewService } from 'src/review/review.service';

@Controller('products')
export class ProductController {
    constructor(
        private productService: ProductService,
        private reviewService: ReviewService
    ){}
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

    @Get('variants/:id')
    async getProductVariants(@Param('id') productId: string) {
        return await this.productService.getProductVariants(productId);
    }
    @Get('reviews')
    @UseGuards(AuthGuard)
    async getAllreviews(@Query('pid') productId: string, @Req() req){
        return await this.reviewService.getAllReviews(req.user.id, productId)
    }

    @Get('search')
    async searchProducts(@Query('q') query: string) {
        return this.productService.searchProducts(query || '');
    }

    @Get(':title/')
    async getProductById(@Param('title') title: string, @Query('vendor') vendor: string) {
        const product = await this.productService.findOne(title, vendor);

        if (!product) {
            throw new NotFoundException(`Product with ID ${title} not found`);
        }

        return {
            success: true,
            product,
        };
    }

    @Get('search/:name')
    async getPoductByName(@Param('name') name: string){
        return this.productService.getProductsByName(name)
    }

    @Get('suggest/:productName')
    async getProductSuggestion(@Param('productName') productName: string){
        return this.productService.getSimilarSuggestions(productName)
    }
}
