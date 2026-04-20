import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private authService: AuthService){}
    @Post("register")
    async registerUser(@Body() body:any){
        const res = await this.authService.instializeRegistration(body)
        return res
    }

    @Post('completeRegistration')
    async completeRegister(@Body() body: {token: string, password: string} ){
        console.log(body)
        const {message, success} = await this.authService.completeRegistartion({token: body.token, password: body.password})
        if(!success){
            return {message: "Error while setting your password", success: false}
        }
        return {message, success: true}
    }

    @Post('login')
    loginUser(@Body() body: any){
        return this.authService.loginUser(body)
    }

    @Post('refresh')
    refreshTokens(@Body() body: { refreshToken: string }){
        return this.authService.refreshTokens(body.refreshToken)
    }
}
