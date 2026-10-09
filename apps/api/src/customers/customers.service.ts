import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto, GetCustomersDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, options: GetCustomersDto = {}) {
    const { page = 1, limit = 50, search } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { organizationId };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute queries in parallel
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + customers.length < total,
      },
    };
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
