import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.customer.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(organizationId: string, data: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  }) {
    return this.prisma.customer.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async update(organizationId: string, id: string, data: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) {
    await this.findOne(organizationId, id);

    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
