import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorGuard } from 'src/common/guards/auth.vendor';
import { FileInterceptor } from '@nestjs/platform-express';
import { CouponsService } from 'src/coupon/coupon.service';

@Controller('vendor')
export class VendorController {
    constructor(
        private vendorService: VendorService,
        private couponsService: CouponsService,
    ) { }

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
        return this.vendorService.getOrders(req.user.id)
    }

    @Get('orders/stats')
    @UseGuards(VendorGuard)
    getOrderStats(@Req() req){
        return this.vendorService.getOrderStats(req.user.id)
    }

    @Get('orders/:id')
    @UseGuards(VendorGuard)
    getOrderDetails(@Req() req, @Param('id') id: string){
        return this.vendorService.getOrderDetails(req.user.id, id)
    }

    @Patch('orders/:id/status')
    @UseGuards(VendorGuard)
    updateOrderStatus(@Req() req, @Param('id') id: string, @Body('status') status: string){
        return this.vendorService.updateOrderStatus(req.user.id, id, status)
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

    // Vendor coupon management
    @Post('coupons')
    @UseGuards(VendorGuard)
    async createVendorCoupon(@Req() req, @Body() body: any) {
        return this.couponsService.createVendorCoupon(body, req.user.id);
    }

    @Get('coupons')
    @UseGuards(VendorGuard)
    async getVendorCoupons(@Req() req) {
        return this.couponsService.findVendorCoupons(req.user.id);
    }
}
