import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  // 1. CREATE ADDRESS
  async create(userId: number, dto: CreateAddressDto) {
    // If this new address is set as default, unset others first
    if (dto.isDefault) {
      await this.unsetOtherDefaults(userId);
    }

    const address = this.addressRepo.create({
      ...dto,
      user: { id: userId } as User,
    });

    return await this.addressRepo.save(address);
  }

  // 2. GET ALL ADDRESSES FOR A USER
  async findAll(userId: number) {
    return await this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' }, // Show default first
    });
  }

  // 3. UPDATE ADDRESS
  async update(userId: number, addressId: number, dto) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address not found');

    // If user is changing THIS address to default, unset others
    if (dto.isDefault && !address.isDefault) {
      await this.unsetOtherDefaults(userId);
    }

    Object.assign(address, dto);
    return await this.addressRepo.save(address);
  }

  // 4. DELETE ADDRESS
  async remove(userId: number, addressId: number) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepo.remove(address);
    return { success: true, message: 'Address deleted successfully' };
  }

  // INTERNAL HELPER: Ensure only one address is "Default"
  private async unsetOtherDefaults(userId: number) {
    await this.addressRepo.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );
  }
}