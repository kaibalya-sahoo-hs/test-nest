import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt'
import { Product } from 'src/product/product.entity';
import { Vendor } from 'src/vendor/vendor.entity';
import { Order } from 'src/payment/order.entity';
import { Payment } from 'src/payment/payment.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Product) private productRepo: Repository<Product>,
        @InjectRepository(Vendor) private vendorRepo: Repository<Vendor>,
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
        private cloudinaryService: CloudinaryService,
    ) { }

    deletUser(id: number) {
        const user = this.userRepo.delete(id)
        return user
    }

    findAllUsers() {
        return this.userRepo.find()
    }

    findUserById(id: number) {
        return this.userRepo.findOneBy({ id })
    }

    deletAllUsers() {
        return this.userRepo.deleteAll()
    }

    async saveImage(id, file) {
        try {
            const result = await this.cloudinaryService.uploadImage(file)
            const user: User | null = await this.userRepo.findOneBy({ id })
            console.log("User : ", user)
            if (user && result && result.url) {
                user.profile = result.url
                await this.userRepo.save(user)
                return { success: true, url: result && result.url }
            }
            return { success: false, message: "Error while saving the image" }
        } catch (error) {
            console.log("Error while uplaoding the image", error)
            return { message: "Error while uplaoding the image", success: false }
        }
    }

    async editUserInfo(body) {
        try {
            const updatedUser = await this.userRepo.update(body.id, body.updatedCredentials)
            return { success: true, message: "Updated successfully" }
        } catch (error) {
            console.log("error while updateing user", error)
            return { success: false, message: "Error while updating" }
        }
    }


    async createUsers(users: [{ name: string, email: string, role: 'string', password: string }]) {
        try {
            console.log(users)
            if (!users || !Array.isArray(users)) {
                return { message: "Invalid data format", success: false }
            }

            try {

                const usersToinsert = await Promise.all(users.map(async (u) => {
                    return {
                        name: u.name,
                        email: u.email,
                        role: u.role || 'guest',
                        password: await bcrypt.hash(u.password, 10)
                    }
                }))


                const result = await this.userRepo.save(usersToinsert)
                console.log(result)

                return { message: "Successfuly inserted users", success: true }

            } catch (error) {
                console.log("Error while creating the users", error)
                return { message: "Error while creating the users", success: false }
            }
        } catch (error) {
            console.log("Error while uplaoding csv", error)
            return { message: "Error while uploading CSV file", success: false }
        }
    }

    async uploadProductImage(id: string, image: any) {
        try {
            const product = await this.productRepo.findOneBy({ id });
    
            if (!product) {
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
    
            const result = await this.cloudinaryService.uploadImage(image)

            if(result?.url){
                product.image = result?.url;
            }
    
            return {success: true}
        } catch (error) {
            console.log(error)
            return {message: "Error while uplaoding the image", success: false}
        }
    }

    // =================== VENDOR MANAGEMENT ===================

    async findAllVendors(status?: string) {
        try {
            const where: any = {};
            if (status) {
                where.vendorStatus = status;
            }
            const vendors = await this.vendorRepo.find({
                where,
                order: { id: 'DESC' },
            });

            // Enrich with product count and order count
            const enrichedVendors = await Promise.all(vendors.map(async (vendor) => {
                const productCount = await this.productRepo.count({ where: { vendor: { id: vendor.id } } });
                const orderCount = await this.orderRepo.count({ where: { vendor: { id: vendor.id } } });
                return {
                    ...vendor,
                    password: undefined,
                    productCount,
                    orderCount,
                };
            }));

            return { success: true, vendors: enrichedVendors };
        } catch (error) {
            console.log("Error fetching vendors", error);
            return { success: false, message: "Error fetching vendors" };
        }
    }

    async getVendorById(id: number) {
        try {
            const vendor = await this.vendorRepo.findOne({ where: { id }, relations: ['products'] });
            if (!vendor) {
                throw new NotFoundException(`Vendor with ID ${id} not found`);
            }
            const orderCount = await this.orderRepo.count({ where: { vendor: { id } } });
            const totalEarnings = vendor.balance || 0;

            return {
                success: true,
                vendor: {
                    ...vendor,
                    password: undefined,
                    orderCount,
                    totalEarnings,
                },
            };
        } catch (error) {
            console.log("Error fetching vendor", error);
            return { success: false, message: "Error fetching vendor details" };
        }
    }

    async updateVendorStatus(id: number, status: 'approved' | 'rejected' | 'suspended') {
        try {
            const vendor = await this.vendorRepo.findOneBy({ id });
            if (!vendor) {
                throw new NotFoundException(`Vendor with ID ${id} not found`);
            }

            // Validate status transitions
            const validTransitions = {
                'pending': ['approved', 'rejected'],
                'approved': ['suspended'],
                'rejected': ['approved'], // Allow re-approval of rejected vendors
                'suspended': ['approved'],
            };

            const allowed = validTransitions[vendor.vendorStatus] || [];
            if (!allowed.includes(status)) {
                throw new BadRequestException(`Cannot transition from '${vendor.vendorStatus}' to '${status}'`);
            }

            vendor.vendorStatus = status;
            await this.vendorRepo.save(vendor);

            return { success: true, message: `Vendor status updated to '${status}'`, vendor: { ...vendor, password: undefined } };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            console.log("Error updating vendor status", error);
            return { success: false, message: "Error updating vendor status" };
        }
    }

    async updateCommissionRate(id: number, rate: number) {
        try {
            if (rate < 0 || rate > 1) {
                throw new BadRequestException('Commission rate must be between 0 and 1');
            }
            const vendor = await this.vendorRepo.findOneBy({ id });
            if (!vendor) {
                throw new NotFoundException(`Vendor with ID ${id} not found`);
            }

            vendor.commisionRate = rate;
            await this.vendorRepo.save(vendor);

            return { success: true, message: `Commission rate updated to ${(rate * 100).toFixed(1)}%` };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
            console.log("Error updating commission rate", error);
            return { success: false, message: "Error updating commission rate" };
        }
    }

    async getPaymentLogs(paymentId){
        const payment = await this.paymentRepo.findOne({where: {id: paymentId}, relations: ['order']})
        return {logs: payment?.statusHisotry, order: payment?.order.id}
    }

    async getPayments(orderId){
        const order = await this.orderRepo.findOne({where: {id: orderId}, relations: ['payments', 'payments.statusHisotry']})
        return {payments: order?.payments}
    }
}