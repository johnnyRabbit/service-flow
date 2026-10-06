import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, includeInactive = false) {
    return this.prisma.service.findMany({
      where: {
        organizationId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            requests: true,
            appointments: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async create(organizationId: string, data: CreateServiceDto) {
    return this.prisma.service.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        icon: data.icon || 'Wrench',
        requiredFields: data.requiredFields || [],
        optionalFields: data.optionalFields || [],
        rules: data.rules || [],
        estimatedDuration: data.estimatedDuration || 60,
        basePrice: data.basePrice,
      },
    });
  }

  async update(id: string, data: UpdateServiceDto) {
    await this.findOne(id);

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.service.delete({
      where: { id },
    });
  }
}
