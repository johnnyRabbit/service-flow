import { IsString, IsEmail, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  autonomyLevel?: number;

  @IsObject()
  @IsOptional()
  businessHours?: any;

  @IsArray()
  @IsOptional()
  serviceZones?: string[];

  @IsArray()
  @IsOptional()
  prohibitedAICategories?: string[];
}

export class UpdateOrganizationDto {
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
  timezone?: string;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  autonomyLevel?: number;

  @IsObject()
  @IsOptional()
  businessHours?: any;

  @IsArray()
  @IsOptional()
  serviceZones?: string[];

  @IsArray()
  @IsOptional()
  prohibitedAICategories?: string[];
}
