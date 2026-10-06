import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AutomationsService } from './automations.service';
import { CreateAutomationRuleDto, UpdateAutomationRuleDto } from './dto/automation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('automations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findAll(@Req() req, @Query('includeDisabled') includeDisabled?: string) {
    return this.automationsService.findAll(req.user.organizationId, includeDisabled === 'true');
  }

  @Get('trigger/:trigger')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findByTrigger(@Req() req, @Param('trigger') trigger: string) {
    return this.automationsService.findByTrigger(req.user.organizationId, trigger);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  findOne(@Req() req, @Param('id') id: string) {
    return this.automationsService.findOne(id, req.user.organizationId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  create(@Req() req, @Body() createAutomationRuleDto: CreateAutomationRuleDto) {
    return this.automationsService.create(req.user.organizationId, createAutomationRuleDto);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateAutomationRuleDto: UpdateAutomationRuleDto,
  ) {
    return this.automationsService.update(id, req.user.organizationId, updateAutomationRuleDto);
  }

  @Patch(':id/toggle')
  @Roles(Role.OWNER, Role.ADMIN)
  toggle(@Req() req, @Param('id') id: string) {
    return this.automationsService.toggle(id, req.user.organizationId);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Req() req, @Param('id') id: string) {
    return this.automationsService.remove(id, req.user.organizationId);
  }
}
