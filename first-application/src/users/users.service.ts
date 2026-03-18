import { Body, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
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
}