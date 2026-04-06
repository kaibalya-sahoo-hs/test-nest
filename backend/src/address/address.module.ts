import { Module } from '@nestjs/common';
import { AddressesService } from './address.service';
import { AddressesController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Address])],
  providers: [AddressesService],
  controllers: [AddressesController]
})
export class AddressModule {}
