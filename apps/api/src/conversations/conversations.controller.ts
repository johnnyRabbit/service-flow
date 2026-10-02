import { Controller, Get, Put, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  async findAll(@Request() req, @Query() filters: {
    state?: string;
    customerId?: string;
    assignedUserId?: string;
  }) {
    return this.conversationsService.findAll(req.user.organizationId, filters);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.conversationsService.findOne(req.user.organizationId, id);
  }

  @Put(':id/state')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN)
  async updateState(@Request() req, @Param('id') id: string, @Body() body: {
    state: string;
    assignedUserId?: string;
  }) {
    return this.conversationsService.updateState(
      req.user.organizationId,
      id,
      body.state,
      body.assignedUserId
    );
  }
}
