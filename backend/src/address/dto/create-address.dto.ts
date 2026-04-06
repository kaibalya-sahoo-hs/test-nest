import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsPostalCode, IsPhoneNumber } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  // Optional: Use @IsPhoneNumber('IN') for Indian numbers specifically
  phoneNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Street address is required' })
  streetAddress: string;

  @IsString()
  @IsOptional()
  landmark?: string;

  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  state: string;

  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  postalCode: string;

  @IsOptional()
  @IsEnum(['home', 'work', 'other'], { message: 'Type must be home, work, or other' })
  addressType?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}