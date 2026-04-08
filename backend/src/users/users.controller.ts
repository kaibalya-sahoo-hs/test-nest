import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "src/common/guards/auth.guard";
import { UserService } from "./users.service";
import { CouponsService } from "src/coupon/coupon.service";

@Controller("users")
export class UserController {
  constructor(private userService: UserService, private couponService: CouponsService) { }
  @Get()
  getUser() {
    return this.userService.findAllUsers()
  }

  @Post()
  createUser(@Body() body: any) {
    return this.userService.createUser(body)
  }

  @Delete(':id')
  deleteUser(@Param() body: any) {
    return this.userService.deletUser(body.id)
  }

  // Self-service: get own profile by ID
  @Get('profile/:id')
  @UseGuards(AuthGuard)
  getProfile(@Param('id') id: number) {
    return this.userService.findById(id)
  }

  @Get('my-orders')
  @UseGuards(AuthGuard)
  async getMyOrders(@Req() req) {
    const userId = req.user.id;
    return this.userService.getUserOrders(userId);
  }

  @Get('my-orders/:id')
  @UseGuards(AuthGuard)
  async getOrderDetail(@Req() req, @Param('id') id: string) {
    const userId = req.user.id;
    return this.userService.getOrderDetail(userId, id);
  }

  // Self-service: update own profile
  @Patch('profile/update')
  updateProfile(@Body() body: any) {
    return this.userService.updateProfile(body.id, body.updatedCredentials)
  }

  // Self-service: upload own profile photo
  @Post('profile/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    return this.userService.uploadProfilePhoto(body.id, file)
  }

  @Post('applycoupon')
  applyCoupon(@Query('coupon') coupon: string, @Body() body:any) {
    return this.couponService.applyCoupon(coupon, body.cartId)
  }

}