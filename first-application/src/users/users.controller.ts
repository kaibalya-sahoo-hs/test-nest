import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
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