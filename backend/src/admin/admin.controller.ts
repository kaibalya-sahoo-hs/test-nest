import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiLogsService } from 'src/api-logs/api-logs.service';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { MailService } from 'src/mail/mail.service';
import { MemberService } from 'src/member/member.service';
import { UserService } from 'src/users/users.service';
import { AuthService } from '../auth/auth.service';
import { AdminService } from './admin.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/product/product.entity';
import { CouponsService } from 'src/coupon/coupon.service';
import { PaymentService } from 'src/payment/payment.service';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    @InjectQueue('user')
    private readonly importQueue: Queue,
    private readonly adminService: AdminService,
    private readonly memberService: MemberService,
    private readonly productService: ProductService,
    private userSevice: UserService,
    private mailService: MailService,
    private apiLogService: ApiLogsService,
    private couponsService: CouponsService,
    private paymentService: PaymentService,
  ) {}
  @Get('users')
  getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('dashboard')
  async getDashBoardDetails() {
    return await this.adminService.getDashBoardDetails();
  }

  @Get('users/:id')
  getUserById(@Param('id') id: number) {
    return this.adminService.findUserById(id);
  }

  @Delete('/users/:id')
  deleteUser(@Param() body: any) {
    return this.adminService.deletUser(body.id);
  }

  @Post('user')
  async addUser(
    @Body() body,
  ) {
    return await this.adminService.createUser(body);
  }

  @Post('vendor')
  async addVendor(
    @Body() body,
  ) {
    return await this.adminService.createVendor(body);
  }

  @Patch('edit')
  async editUserInfo(@Body() body: any) {
    console.log(body);
    const res = await this.adminService.editUserInfo(body);
    return res;
  }

  @Delete('members/:id')
  async removeMember(@Param('id', ParseIntPipe) id: number) {
    return await this.memberService.deleteMember(id);
  }

  @Post('uploadProfile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.adminService.saveImage(body.id, file);
  }

  @Post('send-mail')
  async sendmail(@Body() body: any) {
    const { name, email, registartionToken } = body;
    const result = await this.mailService.sendMail(
      email,
      name,
      registartionToken,
    );
    if (!result) {
      return { message: 'Error while sending mail', success: false };
    }
    return { message: `Email sent to the user ${name}`, success: true };
  }

  @Get('apilogs')
  async getApiLogs() {
    return this.apiLogService.getAllLogs();
  }

  @Post('users')
  async createUsers(@Body() body, @Req() req) {
    const admin = req.user;
    const job = await this.importQueue.add('process-job', {
      users: body.users,
      adminEmail: admin.email,
    });
    console.log('Queued JobID: ', job.id);
    return {
      message:
        'Import started in the background. You will be notified when the report is ready.',
      status: 'processing',
      success: true,
    };
  }

  @Post('products')
  @UseInterceptors(FileInterceptor('file'))
  async adminCreateProduct(
    @Body() data: Partial<Product>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { message: 'Product photo is required', success: false };
    }
    return await this.productService.create(data, file);
  }

  @Get('products')
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

  @Get('products/:id')
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

  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.remove(id);
  }

  @Patch('products/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateProduct(
    @Param('id') id: string,
    @Body() updateData: any,
    @UploadedFile() file,
  ) {
    return await this.productService.update(id, updateData, file);
  }

  @Get('coupons')
  async getAllCoupons() {
    return await this.couponsService.findAllCoupons();
  }

  @Get('payments')
  async getAllPayments() {
    return this.paymentService.getAllPayments();
  }

  @Get('orders')
  async getAllOrders() {
    return this.paymentService.getAllOrders();
  }

  // =================== VENDOR MANAGEMENT ===================

  @Get('vendors')
  async getAllVendors(@Query('status') status?: string) {
    return this.adminService.findAllVendors(status);
  }

  @Get('vendors/:id')
  async getVendorById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getVendorById(id);
  }

  @Patch('vendors/:id/status')
  async updateVendorStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'approved' | 'rejected' | 'suspended',
  ) {
    return this.adminService.updateVendorStatus(id, status);
  }

  @Patch('vendors/:id/commission')
  async updateCommissionRate(
    @Param('id', ParseIntPipe) id: number,
    @Body('rate') rate: number,
  ) {
    return this.adminService.updateCommissionRate(id, rate);
  }

  @Get('logs/payments/:paymentId')
  async getPaymentLogs(@Param('paymentId') paymentId: string) {
    return await this.adminService.getPaymentLogs(paymentId);
  }

  @Get('orders/payments/:orderId')
  async getPayments(@Param('orderId') orderId: string) {
    return this.adminService.getPayments(orderId);
  }

  @Get('orders/:orderId')
  async getOrderById(@Param('orderId') orderId: string) {
    return this.adminService.getOrderById(orderId);
  }
}
