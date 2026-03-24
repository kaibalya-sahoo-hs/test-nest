import { CloudinaryService } from 'src/upload/upload.service';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
export declare class AdminService {
    private userRepo;
    private cloudinaryService;
    constructor(userRepo: Repository<User>, cloudinaryService: CloudinaryService);
    deletUser(id: number): any;
    findAllUsers(): any;
    deletAllUsers(): any;
    saveImage(id: any, file: any): Promise<{
        success: boolean;
        url: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        url?: undefined;
    }>;
    editUserInfo(body: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
