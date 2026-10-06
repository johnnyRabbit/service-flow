import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DelayUnit } from '@prisma/client';

export class CreateAutomationRuleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  trigger: string;

  @IsArray()
  @IsOptional()
  conditions?: any[];

  @IsArray()
  @IsOptional()
  actions?: any[];

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  delay?: number;

  @IsEnum(DelayUnit)
  @IsOptional()
  delayUnit?: DelayUnit;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateAutomationRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  trigger?: string;

  @IsArray()
  @IsOptional()
  conditions?: any[];

  @IsArray()
  @IsOptional()
  actions?: any[];

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @IsOptional()
  delay?: number;

  @IsEnum(DelayUnit)
  @IsOptional()
  delayUnit?: DelayUnit;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
