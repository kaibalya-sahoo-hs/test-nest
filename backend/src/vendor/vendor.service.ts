import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/product.entity';
import { CloudinaryService } from 'src/upload/upload.service';
import { Like, Repository, IsNull, Not } from 'typeorm';
import bcrypt from 'bcrypt'
import { Order } from 'src/payment/order.entity';
import { Vendor } from './vendor.entity';
import { JwtService } from '@nestjs/jwt';
import { Withdraw, WithdrawalStatus } from 'src/payment/withdraw.entity';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class VendorService {
  private rzpX: any
  constructor(
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Withdraw)
    private withdrawRepo: Repository<Withdraw>,
    private cloudinaryService: CloudinaryService,

    private jwtService: JwtService
  ) {
    this.rzpX = new Razorpay({
      key_id: process.env.RAZORPAYX_TEST_APIKEY, // Use Test Keys
      key_secret: process.env.RAZORPAYX_TEST_APISECRET,
    });
  }
  async registerVendor(body) {
    try {
      const { fullname, email, password, storeName, storeDescription } = body

      if (fullname.trim() == "" || email.trim() == "" || storeName.trim() == "" || storeDescription.trim() == "") {
        return { message: "Empty values are not allowed" }
      }
      const existingVendor = await this.vendorRepo.findOne({ where: { email } })
      if (existingVendor) {
        // If the vendor was rejected, allow re-registration
        if (existingVendor.vendorStatus === 'rejected') {
          const hashedPass = await bcrypt.hash(password, 10)
          existingVendor.name = fullname;
          existingVendor.password = hashedPass;
          existingVendor.storeName = storeName;
          existingVendor.storeDescription = storeDescription;
          existingVendor.vendorStatus = 'pending';
          return await this.vendorRepo.save(existingVendor);
        }
        return { message: "Vendor already exist", success: false }
      }
      const hashedPass = await bcrypt.hash(password, 10)

      const neweVendor = this.vendorRepo.create({
        name: fullname,
        email,
        password: hashedPass,
        storeName,
        storeDescription,
        vendorStatus: "pending",
      })

      return await this.vendorRepo.save(neweVendor)
    } catch (error) {
      console.log("Error while registering vendor", error)
      return { messsage: "Error while registering vendor", success: false }
    }
  }

  async loginVendor({ email, password }) {
    // Validation
    if (!email || !email.trim()) {
      return { message: "Email is required", success: false }
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { message: "Invalid email format", success: false }
    }
    if (!password) {
      return { message: "Password is required", success: false }
    }

    const existingUser: Vendor | null = await this.vendorRepo.findOneBy({ email: email.trim().toLowerCase() })
    console.log(existingUser)
    if (!existingUser) {
      return { message: "Vendor does not exist", success: false }
    }

    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      return { message: "Wrong Password", success: false }
    }

    const payload = { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: "vendor" };

    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: '1h' });
    const refreshToken = await this.jwtService.signAsync({ ...payload, type: 'refresh' }, { expiresIn: '1d' });

    return {
      message: "Login successful",
      user: { id: existingUser.id, name: existingUser.name, email: existingUser.email, profile: existingUser.profile, role: "vendor", vendorStatus: existingUser.vendorStatus, balance: existingUser.balance },
      accessToken,
      refreshToken,
      success: true
    }
  }



  // Create a new product
  async createProduct(productData: Partial<Product>, file: Express.Multer.File, userID): Promise<Product> {
    const result = await this.cloudinaryService.uploadImage(file)
    const newProduct = this.productRepo.create({ ...productData, vendor: { id: userID } });
    if (result?.url) {
      newProduct.image = result?.url
    }
    return await this.productRepo.save(newProduct);
  }


  async getVendorDetails(id) {
    const vendor = await this.vendorRepo.findOneBy({ id })
    return { ...vendor, role: "vendor" }
  }

  async getOrders(vendorId) {
    const orders = await this.orderRepo.find({
      where: { vendor: { id: vendorId } },
      relations: ['user', 'deliveryAddress'],
      order: { createdAt: 'DESC' }
    })
    return orders
  }

  async getOrderDetails(vendorId: number, orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, vendor: { id: vendorId } },
      relations: ['user', 'deliveryAddress', 'parentOrder'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    return { success: true, order };
  }

  async updateOrderStatus(vendorId: number, orderId: string, newStatus: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, vendor: { id: vendorId } },
      relations: ['parentOrder'],
    });

    if (newStatus == 'processing') {

    }

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Validate status transitions
    const validTransitions = {
      'completed': ['processing'],
      'processing': ['shipped'],
      'shipped': ['delivered'],
    };

    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from '${order.status}' to '${newStatus}'`);
    }

    order.status = newStatus;
    await this.orderRepo.save(order);

    // If all sub-orders of parent are delivered, update parent to delivered
    if (newStatus === 'delivered' && order.parentOrder) {
      const siblings = await this.orderRepo.find({
        where: { parentOrder: { id: order.parentOrder.id } },
      });
      const allDelivered = siblings.every(s => s.status === 'delivered');
      if (allDelivered) {
        await this.orderRepo.update(order.parentOrder.id, { status: 'delivered' });
      }
    }

    return { success: true, message: `Order status updated to '${newStatus}'`, order };
  }

  async getOrderStats(vendorId: number) {
    const totalOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId } } });
    const pendingOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId }, status: 'pending' } });
    const completedOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId }, status: 'completed' } });
    const processingOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId }, status: 'processing' } });
    const shippedOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId }, status: 'shipped' } });
    const deliveredOrders = await this.orderRepo.count({ where: { vendor: { id: vendorId }, status: 'delivered' } });

    return { totalOrders, pendingOrders, completedOrders, processingOrders, shippedOrders, deliveredOrders };
  }

  // Get all products (with optional pagination)
  async findAllProducts(userId): Promise<Product[]> {
    const products = await this.productRepo.find({ where: { vendor: { id: userId } }, order: { createdAt: 'DESC' } });
    return products
  }

  // Find one by ID
  async findProduct(id: string, userId): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, vendor: { id: userId } } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async getProductsByName(name: string) {
    try {
      const products = await this.productRepo.find({ where: { name: Like(`%${name}%`) } })
      return { products, success: true }
    } catch (error) {
      console.log("Error while searching ", error)
      return { message: "Error while searching", success: false }
    }
  }

  // Edit / Update product
  async updateProduct(id: string, updateData: any, file?: Express.Multer.File) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file);
      updateData.image = upload?.secure_url;
    }
    Object.assign(product, updateData);
    return await this.productRepo.save(product);
  }

  // Delete product
  async removeProduct(id: string, userId): Promise<{ deleted: boolean }> {
    const product = await this.findProduct(id, userId);
    await this.productRepo.remove(product);
    return { deleted: true };
  }

  async createWithdrawal(vendorId, amount = 0) {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } })
    const currentBalance = vendor?.balance
    if (currentBalance) {
      if (currentBalance < amount) {
        throw new BadRequestException('Insufficient funds in your wallet');
      }

    }


    const contact = await (this.rzpX as any).api.post({
      url: '/contacts',
      data: {
        name: vendor?.name,
        email: vendor?.email,
      },
    });

    const fundAccount = await (this.rzpX as any).api.post({
      url: '/fund_accounts',
      data: {
        contact_id: contact.id,
        account_type: 'bank_account',
        bank_account: {
          name: "Test Vendor",
          ifsc: "RAZR0000001",
          account_number: "112233445566",
        },
      }
    })


    const payout = await (this.rzpX as any).api.post({
      url: '/payouts',
      data: {
        account_number: '2323230096795693', // YOUR RazorpayX Account (Only here!)
        fund_account_id: fundAccount.id,
        amount: amount * 100,
        currency: 'INR',
        mode: 'IMPS',
        purpose: 'payout',
      },
    });


    if (vendor) {
      vendor.balance -= amount;

      await this.vendorRepo.save(vendor);
      const withdrawal = this.withdrawRepo.create({ vendor: { id: vendorId }, amount, status: WithdrawalStatus.PENDING, remainingBalance: vendor.balance, payoutId: payout.id })
      await this.withdrawRepo.save(withdrawal)
    }

    return { success: true, message: "Payout created" }
  }

  verifySignature(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret || '')
      .update(rawBody)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Processes the payout event
   */
  async processWebhookEvent(payload: any) {
    const { event, payload: data } = payload;

    const payout = data.payout.entity;
    const rzpPayoutId = payout.id;

    // Find the record in your database using the Razorpay Payout ID
    const withdrawal = await this.withdrawRepo.findOne({
      where: { payoutId: rzpPayoutId },
    });

    if (!withdrawal) {
      return { withdrawal, success: false }
    }

    switch (event) {
      case 'payout.processed':
        withdrawal.status = WithdrawalStatus.PROCESSING;
        break;

      case 'payout.reversed':
      case 'payout.rejected':
      case 'payout.failed':
        withdrawal.status = WithdrawalStatus.FAILED;
        break;

      case 'payout.initiated':
        withdrawal.status = WithdrawalStatus.COMPLETED;
        break;
    }

    await this.withdrawRepo.save(withdrawal);
  }

  async getWithdrawHistory(vendorId){
    const withdraws = await this.withdrawRepo.find({where: {vendor: {id:vendorId}}})
    return {withdraws, success:true}
  }

  async getBalance(id){
    const vendor = await this.vendorRepo.findOne({where: {id}})
    return {balance: vendor?.balance, success: true}
  }
}

