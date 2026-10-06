import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  findAll(@Req() req, @Query() filters: any) {
    // Technicians and viewers can only see their own appointments
    if (req.user.role === 'TECHNICIAN' || req.user.role === 'VIEWER') {
      filters.assignedUserId = req.user.id;
    }
    return this.appointmentsService.findAll(req.user.organizationId, filters);
  }

  @Get('stats')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  getStats(@Req() req) {
    return this.appointmentsService.getStats(req.user.organizationId);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  findOne(@Req() req, @Param('id') id: string) {
    return this.appointmentsService.findOne(id, req.user.organizationId);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.organizationId, createAppointmentDto);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN)
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, req.user.organizationId, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  remove(@Req() req, @Param('id') id: string) {
    return this.appointmentsService.remove(id, req.user.organizationId);
  }
}
