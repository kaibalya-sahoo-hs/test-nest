// src/coupons/coupons.service.ts
import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './coupon.entity';
import { Cart } from 'src/cart/cart.entity';
import { Product } from 'src/product/product.entity';

@Injectable()
export class CouponsService {
    constructor(
        @InjectRepository(Coupon)
        private couponRepo: Repository<Coupon>,
        @InjectRepository(Cart)
        private cartRepo: Repository<Cart>,
        @InjectRepository(Product)
        private productRepo: Repository<Product>
    ) { }

    async applyCoupon(couponCode, cartId) {
        try {
            const cart = await this.cartRepo.findOne({ where: { id: cartId }, relations: ['cartItems', 'cartItems.product', 'cartItems.product.vendor'] })
            if (!cart) {
                return { message: 'Invalid cart id', success: false }
            }
            const result = await this.validateCoupon(couponCode, cart)

            cart.coupon = result.coupon as any;
            cart.discount = result.discountAmount;
            cart.discountedAmount = cart.totalAmount - result.discountAmount;

            const savedCart = await this.cartRepo.save(cart)

            return { success: true, message: 'Coupon applied successfully', savedCart }
        } catch (error) {
            console.log("Error while applying coupon", error)
            const msg = error?.response?.message || error?.message || 'Error while applying coupon';
            return { message: msg, success: false }
        }
    }

    async removeCouponFromCart(userId: number) {
        const cart = await this.cartRepo.findOne({
            where: { user: { id: userId } },
            relations: ['cartItems', 'cartItems.product', 'coupon'],
        });

        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        cart.coupon = null;
        cart.discount = 0;

        const subTotal = cart.cartItems.reduce((sum, item) => {
            return sum + item.product.price * item.quantity;
        }, 0);
        cart.totalAmount = subTotal;
        cart.discountedAmount = subTotal;

        await this.cartRepo.save(cart);

        return { success: true, message: 'Coupon removed successfully' };
    }

    /**
     * Validate a coupon and calculate discount based on scope:
     * - 'global': applies to all cart items
     * - 'vendor': applies to cart items from the coupon's vendor
     * - 'product': applies only to cart items in coupon.products
     */
    async validateCoupon(code: string, cart: any) {

        const coupon = await this.couponRepo.findOne({
            where: { displayName: code.toLowerCase(), isActive: true },
            relations: ['vendor', 'products']
        });

        if (!coupon) {
            throw new NotFoundException('Coupon code is not available');
        }

        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('This coupon has reached its usage limit');
        }

        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            throw new BadRequestException('This coupon has expired');
        }

        // Filter cart items based on coupon scope
        let validCartItems: any[] = [];

        if (coupon.scope === 'global') {
            // Global coupons apply to all items
            validCartItems = cart.cartItems;
        } else if (coupon.scope === 'vendor') {
            // Vendor coupons apply to items from the coupon's vendor
            if (!coupon.vendor) {
                throw new BadRequestException('Vendor coupon is misconfigured');
            }
            validCartItems = cart.cartItems.filter(item =>
                item.product.vendor && item.product.vendor.id === coupon.vendor.id
            );
        } else if (coupon.scope === 'product') {
            // Product coupons apply to specific products
            const couponProductIds = (coupon.products || []).map(p => p.id);
            validCartItems = cart.cartItems.filter(item =>
                couponProductIds.includes(item.product.id)
            );
        }

        if (validCartItems.length === 0) {
            throw new BadRequestException('This coupon is not applicable to any items in your cart');
        }

        // Calculate the eligible subtotal (items the coupon applies to)
        const eligibleSubtotal = validCartItems.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        // Check minimum amount requirement
        if (coupon.minimumAmount && eligibleSubtotal < coupon.minimumAmount) {
            throw new BadRequestException(`Minimum order amount of ₹${coupon.minimumAmount} required for this coupon`);
        }

        // Calculate discount
        let discountAmount = 0;

        if (coupon.type === 'percentage') {
            discountAmount = (eligibleSubtotal * Number(coupon.discountValue)) / 100;
        } else {
            // Fixed discount
            discountAmount = Number(coupon.discountValue);
        }

        // Cap discount at max discount amount if set
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
        }

        // Discount cannot exceed the cart total
        discountAmount = Math.min(discountAmount, cart.totalAmount);

        return {
            coupon,
            code: coupon.code,
            discountAmount,
            type: coupon.type,
            value: coupon.discountValue,
            creatorType: coupon.creatorType,
            vendorId: coupon.vendor?.id || null,
            scope: coupon.scope,
        };
    }

    // Create coupon for a vendor
    async create(vendorId, productIds = [], couponData) {
        const uniqueCode = `V-${vendorId}-${couponData.code}`

        const existing = await this.couponRepo.findOne({
            where: { code: uniqueCode.toUpperCase() }
        });

        if (existing) {
            throw new BadRequestException('This coupon code already exists');
        }

        let products: Product[] = []
        const scope = couponData.scope || 'product';

        if (scope === 'vendor') {
            // Auto-assign all vendor products (at time of creation)
            products = await this.productRepo.find({ where: { vendor: { id: vendorId } } })
        } else if (scope === 'product') {
            // Assign specific products
            for (const productId of productIds) {
                const product = await this.productRepo.findOne({ where: { id: productId } })
                if (product) {
                    products.push(product)
                }
            }
            if (products.length === 0) {
                throw new BadRequestException('At least one valid product is required for product-scope coupons');
            }
        }
        // For 'global' scope, products remains empty — validated against all items at apply time

        const newCoupon = this.couponRepo.create({
            code: uniqueCode.toUpperCase(),
            vendor: { id: vendorId },
            products,
            description: couponData.description,
            displayName: couponData.code.toLowerCase(),
            discountValue: couponData.discount,
            creatorType: 'vendor',
            expiryDate: couponData.expiry,
            isActive: couponData.isActive !== undefined ? couponData.isActive : true,
            usageLimit: couponData.usageLimit,
            minimumAmount: couponData.minAmount || null,
            maxDiscountAmount: couponData.maxDiscount || null,
            scope,
            type: couponData.type
        })
        return await this.couponRepo.save(newCoupon);
    }

    // Update coupon (vendor-scoped)
    async updateCoupon(couponId: number, vendorId: number, updateData: any) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor', 'products'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        // Update allowed fields
        if (updateData.description !== undefined) coupon.description = updateData.description;
        if (updateData.discount !== undefined) coupon.discountValue = updateData.discount;
        if (updateData.type !== undefined) coupon.type = updateData.type;
        if (updateData.expiry !== undefined) coupon.expiryDate = updateData.expiry || null;
        if (updateData.usageLimit !== undefined) coupon.usageLimit = updateData.usageLimit;
        if (updateData.minAmount !== undefined) coupon.minimumAmount = updateData.minAmount || null;
        if (updateData.maxDiscount !== undefined) coupon.maxDiscountAmount = updateData.maxDiscount || null;

        // Handle scope change
        if (updateData.scope !== undefined) {
            coupon.scope = updateData.scope;
        }

        // Update products based on scope
        if (coupon.scope === 'vendor') {
            coupon.products = await this.productRepo.find({ where: { vendor: { id: vendorId } } });
        } else if (coupon.scope === 'product' && updateData.productIds && updateData.productIds.length > 0) {
            const newProducts: Product[] = [];
            for (const productId of updateData.productIds) {
                const product = await this.productRepo.findOne({ where: { id: productId } });
                if (product) {
                    newProducts.push(product);
                }
            }
            coupon.products = newProducts;
        } else if (coupon.scope === 'global') {
            coupon.products = [];
        }

        if (updateData.code !== undefined) {
            const newUniqueCode = `V-${vendorId}-${updateData.code}`;
            coupon.code = newUniqueCode.toUpperCase();
            coupon.displayName = updateData.code.toLowerCase();
        }

        return await this.couponRepo.save(coupon);
    }

    // Delete coupon (vendor-scoped)
    async deleteCoupon(couponId: number, vendorId: number) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        await this.couponRepo.remove(coupon);
        return { success: true, message: 'Coupon deleted successfully' };
    }

    // Toggle coupon active state (vendor-scoped)
    async toggleCouponActive(couponId: number, vendorId: number) {
        const coupon = await this.couponRepo.findOne({
            where: { id: couponId },
            relations: ['vendor'],
        });

        if (!coupon) {
            throw new NotFoundException('Coupon not found');
        }

        if (coupon.vendor?.id !== vendorId) {
            throw new ForbiddenException('You do not own this coupon');
        }

        coupon.isActive = !coupon.isActive;
        const saved = await this.couponRepo.save(coupon);
        return { success: true, isActive: saved.isActive, message: `Coupon ${saved.isActive ? 'activated' : 'deactivated'}` };
    }

    // Get all coupons (for admin)
    async findAllCoupons() {
        return await this.couponRepo.find({ relations: ['vendor', 'products'], order: { id: 'DESC' } });
    }

    // Get coupons for a vendor
    async getCoupons(vendorId: number) {
        const coupons = await this.couponRepo.find({
            where: { vendor: { id: vendorId } },
            relations: ['products'],
            order: { id: 'DESC' }
        });
        return { success: true, coupons }
    }

    // Get coupons applicable to a specific product (for product page display)
    async getCouponsByProduct(productId: string, vendorId: number) {
        const coupons = await this.couponRepo.find({
            where: { vendor: { id: vendorId }, isActive: true },
            order: { id: 'DESC' },
            relations: ['products']
        });

        // Filter: global coupons, vendor-scope coupons from this vendor, or product-scope coupons containing this product
        const filtered = coupons.filter(coupon => {
            if (coupon.scope === 'global') return true;
            if (coupon.scope === 'vendor') return true;
            if (coupon.scope === 'product') {
                return coupon.products.some(p => p.id === productId);
            }
            return false;
        });

        return { success: true, coupons: filtered };
    }

    // Increment usage count after successful payment
    async incrementUsage(couponCode: string) {
        const coupon = await this.couponRepo.findOne({ where: { code: couponCode.toUpperCase() } });
        if (coupon) {
            coupon.usageCount += 1;
            await this.couponRepo.save(coupon);
        }
    }
}
