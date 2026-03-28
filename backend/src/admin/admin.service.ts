import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CloudinaryService } from 'src/upload/upload.service';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService{
    constructor (@InjectRepository(User) private userRepo: Repository<User>, private cloudinaryService: CloudinaryService){}
    
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

    deletAllUsers(){
        return this.userRepo.deleteAll()
    }

    async saveImage(id, file){
        try {
            const result = await this.cloudinaryService.uploadImage(file)
            const user: User | null= await this.userRepo.findOneBy({id})
            console.log("User : ", user)
            if(user && result && result.url){
                user.profile = result.url
                await this.userRepo.save(user)
                return {success: true, url: result && result.url}
            }
            return {success: false, message: "Error while saving the image"}
        } catch (error) {
            console.log("Error while uplaoding the image", error)
            return {message: "Error while uplaoding the image", success: false}
        }
    }

    async editUserInfo(body){
        try {
            await this.userRepo.update(body.id, body.updatedCredentials)
            return {success: true, message: "Updated successfully"}
        } catch (error) {
            console.log("error while updateing user", error)
            return {success: false, message: "Error while updating"}
        }
    }

}