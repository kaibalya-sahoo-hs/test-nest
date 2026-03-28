import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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

  // Self-service: get own profile by ID
  @Get('profile/:id')
  getProfile(@Param('id') id: number){
    return this.userService.findById(id)
  }

  // Self-service: update own profile
  @Patch('profile/update')
  updateProfile(@Body() body: any){
    return this.userService.updateProfile(body.id, body.updatedCredentials)
  }

  // Self-service: upload own profile photo
  @Post('profile/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Body() body: any){
    return this.userService.uploadProfilePhoto(body.id, file)
  }
}