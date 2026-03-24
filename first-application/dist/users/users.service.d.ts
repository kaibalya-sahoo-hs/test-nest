import { CloudinaryService } from 'src/upload/upload.service';
import { Repository } from 'typeorm';
import { User } from './users.entity';
export declare class UserService {
    private userRepo;
    private cloudinarySevice;
    constructor(userRepo: Repository<User>, cloudinarySevice: CloudinaryService);
    findAllUsers(): any;
    findById(id: number): any;
    createUser(data: Partial<User>): any;
    deletUser(id: number): any;
}
