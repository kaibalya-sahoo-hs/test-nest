import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { Product } from 'src/product/product.entity';
import { CloudinaryService } from 'src/upload/upload.service';
import { User } from 'src/users/users.entity';
import { Like, Repository } from 'typeorm';
import bcrypt from 'bcrypt'
import { Order } from 'src/payment/order.entity';

@Injectable()
export class VendorService {
    constructor(
        @InjectRepository(User) 
        private userRepo: Repository<User>,
         @InjectRepository(Product) 
        private productRepo: Repository<Product>, 
         @InjectRepository(Order) 
        private orderRepo: Repository<Order>,
        private cloudinaryService: CloudinaryService,
    ){}
    async registerVendor(body){
        try {
            const {fullname, email, password, storeName, storeDescription} = body

            if(fullname.trim() == "" || email.trim() == "" || storeName.trim() == "" || storeDescription.trim() == ""){
                return {message: "Empty values are not allowed"}
            }
             const existingVendor = await this.userRepo.findOne({where: {email}}) 
             if(existingVendor){
                return {message: "Vendor already exist", success :false}
             }
            const hashedPass = await bcrypt.hash(password, 10)
            
            const neweVendor = this.userRepo.create({
                name: fullname,
                email,
                password: hashedPass,
                storeName,
                storeDescription,
                vendorStatus: "pending",
                role: 'vendor'
            })

            return await this.userRepo.save(neweVendor)
        } catch (error) {
            console.log("Error while registering vendor", error)
            return {messsage: "Error while registering vendor", success: false}
        }
    }


      // Create a new product
      async createProduct(productData: Partial<Product>, file: Express.Multer.File, userID): Promise<Product> {
        const result = await this.cloudinaryService.uploadImage(file)
        const newProduct = this.productRepo.create({...productData, vendor: {id: userID}});
        if(result?.url){
          newProduct.image = result?.url
        }
        return await this.productRepo.save(newProduct);
      }
    
      // Get all products (with optional pagination)
      async findAllProducts(userId): Promise<Product[]> {
        const products =  await this.productRepo.find({where: {vendor: {id: userId}}, order: { createdAt: 'DESC' }});
        console.log(products[0])
        return products
      }
    
      // Find one by ID
      async findProduct(id: string, userId): Promise<Product> {
        const product = await this.productRepo.findOne({ where: { id, vendor: {id: userId} } });
        if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
        return product;
      }
    
      async getProductsByName(name: string){
        try {
          const products = await this.productRepo.find({where: {name: Like(`%${name}%`)}})
          return {products, success: true}
        } catch (error) {
          console.log("Error while searching ", error)
          return {message: "Error while searching", success: false}
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
        const product = await this.findProduct(id,userId);
        await this.productRepo.remove(product);
        return { deleted: true };
      }

      async getAllOrders(vendorId){
        const orders =  await this.orderRepo.find({where: {items: {product: {vendor: {id: vendorId}}}}})
        return orders
      }
}
