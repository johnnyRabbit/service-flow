import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, GetCustomersDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  async findAll(@Request() req, @Query() query: GetCustomersDto) {
    return this.customersService.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER, Role.TECHNICIAN, Role.VIEWER)
  async findOne(@Request() req, @Param('id') id: string) {
    return this.customersService.findOne(req.user.organizationId, id);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async create(@Request() req, @Body() body: CreateCustomerDto) {
    return this.customersService.create(req.user.organizationId, body);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN, Role.MANAGER)
  async update(@Request() req, @Param('id') id: string, @Body() body: UpdateCustomerDto) {
    return this.customersService.update(req.user.organizationId, id, body);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(@Request() req, @Param('id') id: string) {
    return this.customersService.remove(req.user.organizationId, id);
  }
}
