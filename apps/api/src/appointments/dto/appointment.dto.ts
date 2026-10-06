import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentState } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  customerId: string;

  @IsString()
  serviceId: string;

  @IsDateString()
  date: string;

  @IsString()
  time: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsEnum(AppointmentState)
  @IsOptional()
  state?: AppointmentState;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
