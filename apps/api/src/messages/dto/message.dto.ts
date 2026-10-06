import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
import { SenderType } from '@prisma/client';

export class CreateMessageDto {
  @IsString()
  conversationId: string;

  @IsEnum(SenderType)
  senderType: SenderType;

  @IsString()
  senderName: string;

  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];

  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class GetMessagesDto {
  @IsOptional()
  limit?: number;

  @IsOptional()
  offset?: number;

  @IsOptional()
  order?: 'asc' | 'desc';
}
