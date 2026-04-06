import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt'
import { Product } from 'src/product/product.entity';

@Injectable()
export class AdminService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>, @InjectRepository(Product)private productRepo: Repository<Product> , private cloudinaryService: CloudinaryService) { }

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
        // 1. Find the specific product
        try {
            const product = await this.productRepo.findOneBy({ id });
    
        // 2. Handle if product doesn't exist
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
    
        const result = await this.cloudinaryService.uploadImage(image)


        // 3. Update the image field
        if(result?.url){
            product.image = result?.url;
        }
    
        return {success: true}
        } catch (error) {
            console.log(error)
            return {message: "Error while uplaoding the image", success: false}
        }
    }
}