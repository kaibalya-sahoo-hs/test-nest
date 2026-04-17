import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/users.entity";
import { Repository } from "typeorm";
import bcrypt from 'bcrypt'

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

        async onApplicationBootstrap() {
            await this.seedAdmin()
        }

        async seedAdmin(){
            const adminEmail = process.env.ADMIN_EMAIL
            const adminPasssword = process.env.ADMIN_PASSWORD
            
            const admin = await this.userRepo.findOne({where: {email: adminEmail}})
            if(!admin){
                let hashedPass
                if(adminPasssword){
                    hashedPass = await bcrypt.hash(adminPasssword, 10)
                }
                const user = this.userRepo.create({
                    name: "Super Admin",
                    email: adminEmail,
                    password: hashedPass,
                    role: 'admin'
                })

                await this.userRepo.save(user)
                console.log("Admin saved succesfully")
            }
        }
}