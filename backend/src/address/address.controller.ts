import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/common/guards/auth.guard";
import { AddressesService } from "./address.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Controller('addresses')
@UseGuards(AuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateAddressDto) {
    console.log("Called")
    return this.addressesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.addressesService.findAll(req.user.id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto) {
    return this.addressesService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    return this.addressesService.remove(req.user.id, id);
  }
}