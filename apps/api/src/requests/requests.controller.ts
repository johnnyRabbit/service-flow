import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Get()
  findAll(@Request() req) {
    return this.requestsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.requestsService.findOne(req.user.organizationId, id);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  create(@Request() req, @Body() body: any) {
    return this.requestsService.create(req.user.organizationId, body);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.requestsService.update(req.user.organizationId, id, body);
  }
}
