import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Req,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  @UseGuards(AuthGuard)
  async viewCart(@Req() req) {
    return await this.cartService.getMyCart(req.user.id);
  }

  @Post('add')
  @UseGuards(AuthGuard)
  async addToCart(
    @Req() req,
    @Body('productId') productId: string, // Match your Entity type (string/uuid)
    @Body('quantity') quantity?: number,
  ) {
    const userId = req.user.id;
    console.log(userId);
    return await this.cartService.addToCart(userId, productId, quantity || 1);
  }

  @Delete('coupon')
  @UseGuards(AuthGuard)
  async removeCoupon(@Req() req) {
    const userId = req.user.id;
    return await this.cartService.removeCoupon(userId);
  }

  
  @Delete(':id')
  @UseGuards(AuthGuard)
  async removeItem(@Req() req, @Param('id') cartItemId: string) {
    const userId = req.user.id;
    await this.cartService.removeItemByProduct(userId, cartItemId);
    return { message: 'Item removed from cart', success: true };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async updateQuantity(
    @Req() req,
    @Param('id') cartItemId: string,
    @Body('quantity') quantity: number,
    @Body('coupon') coupon?: string,
  ) {
    const userId = req.user.id;
    return await this.cartService.updateQuantityByProduct(
      userId,
      cartItemId,
      quantity,
    );
  }

  

  @Post('sync')
  @UseGuards(AuthGuard) // Ensure user is logged in
  async syncCart(@Req() req, @Body() body: { items: any[] }) {
    const userId = req.user.id;

    if (!body.items || !Array.isArray(body.items)) {
      return await this.cartService.getMyCart(userId);
    }
    return await this.cartService.mergeCarts(userId, body.items);
  }
}
