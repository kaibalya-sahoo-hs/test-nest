import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createReview(
    @Body() body: { content: string; productId: string },
    @Req() req,
  ) {
    return await this.reviewService.createReview(
      req.user.id,
      body.productId,
      body.content,
    );
  }

  @Get('product/:productId')
  async getProductReviews(@Param('productId') productId: string) {
    return await this.reviewService.getProductReviews(productId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async editReview(
    @Param('id') reviewId: string,
    @Body() body: { content: string },
    @Req() req,
  ) {
    return await this.reviewService.editReviewById(
      reviewId,
      req.user.id,
      body.content,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteReview(@Param('id') reviewId: string, @Req() req) {
    return await this.reviewService.deleteReviewById(reviewId, req.user.id);
  }
}
