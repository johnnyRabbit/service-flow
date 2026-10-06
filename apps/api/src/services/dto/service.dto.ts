import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @IsOptional()
  requiredFields?: any[];

  @IsArray()
  @IsOptional()
  optionalFields?: any[];

  @IsArray()
  @IsOptional()
  rules?: any[];

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  basePrice?: number;
}

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @IsOptional()
  requiredFields?: any[];

  @IsArray()
  @IsOptional()
  optionalFields?: any[];

  @IsArray()
  @IsOptional()
  rules?: any[];

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  estimatedDuration?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
