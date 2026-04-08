import { Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/payment/order.entity';
import { CloudinaryService } from 'src/upload/upload.service';
import { Repository } from 'typeorm';
import { User } from './users.entity';


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private cloudinarySevice: CloudinaryService,
        @InjectRepository(Order)
        private orderRepo:Repository<Order>
    ){}

    findAllUsers(){
        return this.userRepo.find()
    }

    findById(id: number){
        return this.userRepo.findOneBy({ id })
    }

    createUser(data: Partial<User>){
        const user = this.userRepo.create(data)
        return this.userRepo.save(user)
    }

    deletUser(id: number){
        const user = this.userRepo.delete(id)
        return user
    }

    async updateProfile(id: number, updatedCredentials: Partial<User>){
        try {
            // Only allow updating name (not role/email for self-service)
            const allowedUpdates: Partial<User> = {};
            if (updatedCredentials.name) allowedUpdates.name = updatedCredentials.name;
            
            await this.userRepo.update(id, allowedUpdates)
            const updatedUser = await this.userRepo.findOneBy({ id })
            return { success: true, message: "Profile updated successfully", user: updatedUser }
        } catch (error) {
            console.log("Error while updating profile", error)
            return { success: false, message: "Error while updating profile" }
        }
    }

    async uploadProfilePhoto(id: number, file: Express.Multer.File){
        try {
            console.log(id, file)
            const result = await this.cloudinarySevice.uploadImage(file)
            const user = await this.userRepo.findOneBy({ id })
            if (user && result && result.url) {
                user.profile = result.url
                await this.userRepo.save(user)
                return { success: true, url: result.url }
            }
            return { success: false, message: "Error while saving the image" }
        } catch (error) {
            console.log("Error while uploading profile photo", error)
            return { success: false, message: "Error while uploading the image" }
        }
    }

    async getUserOrders(userId: number) {
        try {
            const orders = await this.orderRepo.find({
                where: { user: { id: userId } },
                order: { createdAt: 'DESC' },
                relations: ['parentOrder', 'deliveryAddress', 'payments']
            });
            
            // Only return master (parent) orders
            const filteredOrders = orders.filter(order => !order.parentOrder)

            const simplifiedOrders = filteredOrders.map(order => ({
                id: order.id,
                status: order.status,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
                couponCode: order.couponCode,
                discount: order.discount,
                couponType: order.couponType,
                paymentStatus: order.payments?.[0]?.status || 'unknown',
                
                items: order.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    productName: item.product.name,
                    productImage: item.product.image,
                    priceAtPurchase: item.product.price,
                    vendorName: item.product.vendor?.storeName || 'Marketplace',
                }))
            }));
    
            return { success: true, orders: simplifiedOrders };
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new InternalServerErrorException("Failed to fetch your orders");
        }
    }

    async getOrderDetail(userId: number, orderId: string) {
        try {
            // Get the master order
            const masterOrder = await this.orderRepo.findOne({
                where: { id: orderId, user: { id: userId } },
                relations: ['deliveryAddress', 'payments'],
            });

            if (!masterOrder) {
                return { success: false, message: 'Order not found' };
            }

            // Get sub-orders (vendor-specific)
            const subOrders = await this.orderRepo.find({
                where: { parentOrder: { id: orderId } },
                relations: ['vendor'],
            });

            const orderDetail = {
                id: masterOrder.id,
                status: masterOrder.status,
                totalAmount: masterOrder.totalAmount,
                createdAt: masterOrder.createdAt,
                couponCode: masterOrder.couponCode,
                discount: masterOrder.discount,
                couponType: masterOrder.couponType,
                deliveryAddress: masterOrder.deliveryAddress,
                paymentStatus: masterOrder.payments?.[0]?.status || 'unknown',
                paymentId: masterOrder.payments?.[0]?.razorpayPaymentId || null,
                items: masterOrder.items.map(item => ({
                    id: item.id,
                    quantity: item.quantity,
                    productName: item.product.name,
                    productImage: item.product.image,
                    priceAtPurchase: item.product.price,
                    vendorName: item.product.vendor?.storeName || 'Marketplace',
                })),
                subOrders: subOrders.map(sub => ({
                    id: sub.id,
                    vendorName: sub.vendor?.storeName || 'Unknown',
                    status: sub.status,
                    totalAmount: sub.totalAmount,
                    discount: sub.discount,
                    items: sub.items.map(item => ({
                        productName: item.product.name,
                        productImage: item.product.image,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                })),
            };

            return { success: true, order: orderDetail };
        } catch (error) {
            console.error("Error fetching order detail:", error);
            throw new InternalServerErrorException("Failed to fetch order details");
        }
    }
}