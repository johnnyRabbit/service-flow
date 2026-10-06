import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            conversations: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            customers: true,
            conversations: true,
            services: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async create(data: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: {
        ...data,
        timezone: data.timezone || 'Europe/Lisbon',
        autonomyLevel: data.autonomyLevel || 2,
        businessHours: data.businessHours || {},
        serviceZones: data.serviceZones || [],
        prohibitedAICategories: data.prohibitedAICategories || [],
      },
    });
  }

  async update(id: string, data: UpdateOrganizationDto) {
    await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
