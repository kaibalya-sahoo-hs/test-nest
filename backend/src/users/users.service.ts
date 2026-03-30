import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { Repository } from 'typeorm';
import { User } from './users.entity';


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private cloudinarySevice: CloudinaryService
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
}