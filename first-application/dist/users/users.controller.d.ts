import { UserService } from "./users.service";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getUser(): any;
    createUser(body: any): any;
    deleteUser(body: any): any;
}
