import { Body, Controller, Get, NotFoundException, Param, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorGuard } from 'src/common/guards/auth.vendor';
import { ProductService } from 'src/product/product.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vendor')
export class VendorController {
    constructor(private vendorService: VendorService, private vendorSevice: VendorService) { }
    @Post('register')
    registerVendor(@Body() body: any) {
        return this.vendorService.registerVendor(body)
    }


    @Get('products')
    @UseGuards(VendorGuard)
    async getAllProducts(@Req() req) {
        try {
            const userId = req.user.id;
            console.log(userId)
            const products = await this.vendorService.findAllProducts(userId);

            return {
                success: true,
                count: products.length,
                data: products,
            };
        } catch (error) {
            console.log(error)
            return {
                success: false,
                message: 'Failed to fetch products',
                error: error.message,
            };
        }
    }



    @Get('orders')
    @UseGuards(VendorGuard)
    getOrders(@Req() req){
        console.log(req.user)
        return this.vendorService.getOrders(req.user.id)
    }


    @Get(':id')
    getVendorProfile(@Param('id') id){
        return this.vendorService.getVendorDetails(id)
    }
    @Post('login')
    loginVendor(@Body() body: any) {
        return this.vendorService.loginVendor(body)
    }


    @Post('product')
    @UseGuards(VendorGuard)
    @UseInterceptors(FileInterceptor('file'))
    createProduct(@Body() body: any, @Req() req, @UploadedFile() file) {
        const userID = req.user.id
        return this.vendorService.createProduct(body, file, userID)
    }


    @Get('products/:id')
    @UseGuards(VendorGuard)
    async getProductById(@Param('id') id: string, @Req() req) {
        const product = await this.vendorService.findProduct(id, req.user.id);

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return {
            success: true,
            product,
        };
    }
}
