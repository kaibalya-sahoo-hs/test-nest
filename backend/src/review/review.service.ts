import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Review } from './review.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/payment/order.entity';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private reviewRepo: Repository<Review>,
        @InjectRepository(Order)
        private orderRepo: Repository<Order>
    ) { }

    async createReview(userId: number, productId: string, message) {

        const hasOrdered = await this.orderRepo.createQueryBuilder('ordr')
            .where('ordr.userId = :userId', { userId })
            .andWhere('ordr.items::jsonb @> :itemFilter::jsonb', {
                itemFilter: JSON.stringify([{ product: { id: productId } }])
            })
            .getExists()
        if (message.trim() === "") {
            throw new BadRequestException('Content cannot be empty')
        }

        if (!hasOrdered) {
            throw new BadRequestException('You must have ordered this product to leave a review')
        }

        const review = this.reviewRepo.create({
            content: message,
            user: { id: userId },
            product: { id: productId }
        })

        const savedReview = await this.reviewRepo.save(review)
        return { message: "Review created successfully", success: true, review: savedReview }
    }

    async deleteReview(userId, productId) {
        const result = await this.reviewRepo.delete({ user: { id: userId }, product: { id: productId } })
        if (!result) {
            throw new NotFoundException('Review not found')
        }

        return { success: true, message: "Review deleted" }
    }

    async deleteReviewById(reviewId: string, userId: number) {
        const review = await this.reviewRepo.findOne({ where: { id: reviewId }, relations: ['user'] })

        if (!review) {
            throw new NotFoundException('Review not found')
        }

        if (review.user.id !== userId) {
            throw new BadRequestException('You can only delete your own reviews')
        }

        await this.reviewRepo.delete({ id: reviewId })
        return { success: true, message: "Review deleted successfully" }
    }

    async editReview(userId, productId, content: string) {
        if (content.trim() === "") {
            throw new BadRequestException('Content cannot be empty')
        }
        const review = await this.reviewRepo.findOne({ where: { user: { id: userId }, product: { id: productId } } })

        if (!review) {
            throw new NotFoundException('Review not found')
        }

        review.content = content

        await this.reviewRepo.save(review)
        return { success: true, message: "review upadted successfully" }
    }

    async editReviewById(reviewId: string, userId: number, content: string) {
        if (content.trim() === "") {
            throw new BadRequestException('Content cannot be empty')
        }

        const review = await this.reviewRepo.findOne({ where: { id: reviewId }, relations: ['user'] })

        if (!review) {
            throw new NotFoundException('Review not found')
        }

        if (review.user.id !== userId) {
            throw new BadRequestException('You can only edit your own reviews')
        }

        review.content = content
        await this.reviewRepo.save(review)
        return { success: true, message: "Review updated successfully" }
    }

    async getAllReviews(userId, productId) {
        const reviews = await this.reviewRepo.find({ where: { user: { id: userId }, product: { id: productId } } })
        return { reviews }
    }

    async getProductReviews(productId: string) {
        const reviews = await this.reviewRepo.find({
            where: { product: { id: productId } },
            relations: ['user'],
            order: { createdAt: 'DESC' }
        })
        return { success: true, reviews }
    }
}
