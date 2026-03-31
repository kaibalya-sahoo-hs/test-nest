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
    Patch
  } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
  import { CartService } from './cart.service';
  
  @Controller('cart')
  export class CartController {
      constructor(private readonly cartService: CartService) {}
      @Get()
      @UseGuards(AuthGuard)
      async viewCart(@Req() req, @Query('coupon') couponCode?: string) {
        return await this.cartService.getMyCart(req.user.id, couponCode);
    }
  
      @Post('add')
      @UseGuards(AuthGuard)
      async addToCart(
          @Req() req, 
          @Body('productId') productId: string, // Match your Entity type (string/uuid)
          @Body('quantity') quantity?: number
      ) {
          const userId = req.user.id;
          return await this.cartService.addToCart(userId, productId, quantity || 1);
      }
      @Delete(':id')
      @UseGuards(AuthGuard)
      async removeItem(
          @Req() req, 
          @Param('id', ParseIntPipe) cartItemId: number
      ) {
          const userId = req.user.id;
          await this.cartService.removeItem(userId, cartItemId);
          return { message: 'Item removed from cart' };
      }

      @Patch(":id")
      @UseGuards(AuthGuard)
      async updateQuantity(
        @Req() req,
        @Param('id', ParseIntPipe) cartItemId: number,
        @Body('quantity', ParseIntPipe) quantity: number,
    ) {
        const userId = req.user.id;
        console.log(userId)
        return await this.cartService.updateItemQuantity(userId, cartItemId, quantity);
    }
  }