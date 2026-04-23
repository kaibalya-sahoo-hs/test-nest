import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { VendorGuard } from 'src/common/guards/auth.vendor';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CouponsService } from 'src/coupon/coupon.service';
import { File } from 'node:buffer';

@Controller('vendor')
export class VendorController {
  constructor(
    private vendorService: VendorService,
    private couponsService: CouponsService,
  ) {}


  @Get('coupons')
  @UseGuards(VendorGuard)
  async getVendorCoupons(@Req() req) {
    return this.couponsService.getCoupons(req.user.id);
  }

  
  @Post('register')
  registerVendor(@Body() body: any) {
    return this.vendorService.registerVendor(body);
  }

  @Get('balance')
  @UseGuards(VendorGuard)
  async getbalance(@Req() req) {
    return this.vendorService.getBalance(req.user.id);
  }

  @Get('vendorStatus')
  @UseGuards(VendorGuard)
  async getVendorStatus(@Req() req){
    return this.vendorService.getVedorStatus(req.user.id)
  }

  @Get('withdrawals')
  @UseGuards(VendorGuard)
  async getWithdrawHistory(@Req() req) {
    const vendorId = req.user.id;
    return this.vendorService.getWithdrawHistory(vendorId);
  }

  @Get('products')
  @UseGuards(VendorGuard)
  async getAllProducts(@Req() req) {
    try {
      const userId = req.user.id;
      console.log(userId);
      const products = await this.vendorService.findAllProducts(userId);

      return {
        success: true,
        count: products.length,
        data: products,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      };
    }
  }

  @Get('orders')
  @UseGuards(VendorGuard)
  getOrders(@Req() req) {
    return this.vendorService.getOrders(req.user.id);
  }

  @Get('orders/stats')
  @UseGuards(VendorGuard)
  getOrderStats(@Req() req) {
    return this.vendorService.getOrderStats(req.user.id);
  }

  @Get('orders/:id')
  @UseGuards(VendorGuard)
  getOrderDetails(@Req() req, @Param('id') id: string) {
    return this.vendorService.getOrderDetails(req.user.id, id);
  }

  @Patch('products/:id')
  @UseGuards(VendorGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  async updateProduct(
    @Param('id') id: string,
    @Req() req,
    @Body() body: any,
    @UploadedFile() file: File,
  ) {
    // Support both single file (legacy) and multiple files
    const files = (req as any).files || (file ? [file] : []);
    return await this.vendorService.updateProduct(id, body, files);
  }

  @Patch('orders/:id/status')
  @UseGuards(VendorGuard)
  updateOrderStatus(
    @Req() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.vendorService.updateOrderStatus(req.user.id, id, status);
  }

  @Get(':id')
  getVendorProfile(@Param('id') id) {
    return this.vendorService.getVendorDetails(id);
  }

  @Post('login')
  loginVendor(@Body() body: any) {
    return this.vendorService.loginVendor(body);
  }

  @Post('product')
  @UseGuards(VendorGuard)
  @UseInterceptors(FilesInterceptor('files', 5))
  createProduct(@Body() body: any, @Req() req, @UploadedFile() file) {
    const userID = req.user.id;
    // Support both single file (legacy) and multiple files
    const files = (req as any).files || (file ? [file] : []);
    return this.vendorService.createProduct(body, files, userID);
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

  @Delete('products/:id')
  @UseGuards(VendorGuard)
  async deletProduct(@Param('id') id: string, @Req() req) {
    return await this.vendorService.removeProduct(id, req.user.id);
  }

  // Vendor coupon management
  @Post('coupon')
  @UseGuards(VendorGuard)
  async createVendorCoupon(@Req() req, @Body() body: any) {
    return this.couponsService.create(req.user.id, body.productId, body.coupon);
  }

  @Patch('coupon/:id')
  @UseGuards(VendorGuard)
  async updateVendorCoupon(@Req() req, @Param('id') id: number, @Body() body: any) {
    return this.couponsService.updateCoupon(id, req.user.id, body);
  }

  @Delete('coupon/:id')
  @UseGuards(VendorGuard)
  async deleteVendorCoupon(@Req() req, @Param('id') id: number) {
    return this.couponsService.deleteCoupon(id, req.user.id);
  }

  @Patch('coupon/:id/toggle')
  @UseGuards(VendorGuard)
  async toggleVendorCoupon(@Req() req, @Param('id') id: number) {
    return this.couponsService.toggleCouponActive(id, req.user.id);
  }


  @Post('withdraw')
  @UseGuards(VendorGuard)
  async createPayout(@Req() req, @Body() body) {
    return this.vendorService.createWithdrawal(req.user.id, body.amount);
  }

  @Post('update-payout-status')
  async updatePayoutStatus(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req,
    @Res() res,
  ) {
    console.log('web hook trigreed');
    if (!signature) {
      throw new BadRequestException('Missing Razorpay Signature');
    }

    await this.vendorService.processWebhookEvent(req.body);
    return res.status(200).send({ success: true });
  }
}
