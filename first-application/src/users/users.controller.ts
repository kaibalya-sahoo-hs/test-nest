import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "src/upload/upload.service";
import { UserService } from "./users.service";

@Controller("users")
export class UserController{
    constructor (private userService: UserService) {}
  @Get()
  getUser(){
    return this.userService.findAllUsers()
  }

  @Post()
  createUser(@Body() body: any){
    return this.userService.createUser(body)
  }

  @Delete(':id')
  deleteUser(@Param() body: any){
    return this.userService.deletUser(body.id)
  }
}