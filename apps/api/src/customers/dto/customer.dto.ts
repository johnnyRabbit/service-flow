import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class GetCustomersDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
