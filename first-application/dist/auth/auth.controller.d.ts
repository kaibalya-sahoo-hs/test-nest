import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    registerUser(body: any): Promise<any>;
    completeRegister(body: {
        token: string;
        password: string;
    }): Promise<{
        message: any;
        success: boolean;
    }>;
    loginUser(body: any): any;
}
