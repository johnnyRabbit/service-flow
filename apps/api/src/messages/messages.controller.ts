import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto, GetMessagesDto } from './dto/message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('messages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversation/:conversationId')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  findByConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesDto,
  ) {
    return this.messagesService.findByConversation(
      conversationId,
      req.user.organizationId,
      query,
    );
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  findOne(@Req() req, @Param('id') id: string) {
    return this.messagesService.findOne(id, req.user.organizationId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN)
  create(@Req() req, @Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto, req.user.organizationId);
  }

  @Post('conversation/:conversationId/read')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN)
  markAsRead(@Req() req, @Param('conversationId') conversationId: string) {
    return this.messagesService.markAsRead(conversationId, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Req() req, @Param('id') id: string) {
    return this.messagesService.remove(id, req.user.organizationId);
  }
}
