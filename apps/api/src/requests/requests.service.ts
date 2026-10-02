import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, filters?: any) {
    return this.prisma.serviceRequest.findMany({
      where: { organizationId, ...filters },
      include: { customer: true, service: true, assignedUser: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    return this.prisma.serviceRequest.findFirst({
      where: { id, organizationId },
      include: { customer: true, service: true, assignedUser: true },
    });
  }

  async create(organizationId: string, data: any) {
    return this.prisma.serviceRequest.create({
      data: { ...data, organizationId },
    });
  }

  async update(organizationId: string, id: string, data: any) {
    return this.prisma.serviceRequest.update({
      where: { id },
      data,
    });
  }
}
