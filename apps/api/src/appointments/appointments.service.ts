import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, filters: any = {}) {
    const where: any = { organizationId };

    if (filters.state) {
      where.state = filters.state;
    }

    if (filters.assignedUserId) {
      where.assignedUserId = filters.assignedUserId;
    }

    if (filters.dateFrom) {
      where.date = { gte: new Date(filters.dateFrom) };
    }

    if (filters.dateTo) {
      where.date = { ...where.date, lte: new Date(filters.dateTo) };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        service: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        service: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async create(organizationId: string, data: CreateAppointmentDto) {
    // Verify customer belongs to organization
    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, organizationId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${data.customerId} not found`);
    }

    // Verify service belongs to organization
    const service = await this.prisma.service.findFirst({
      where: { id: data.serviceId, organizationId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${data.serviceId} not found`);
    }

    return this.prisma.appointment.create({
      data: {
        organizationId,
        customerId: data.customerId,
        serviceId: data.serviceId,
        date: new Date(data.date),
        time: data.time,
        duration: data.duration || 60,
        assignedUserId: data.assignedUserId,
        notes: data.notes,
        state: 'SCHEDULED',
      },
      include: {
        customer: true,
        service: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, organizationId: string, data: UpdateAppointmentDto) {
    await this.findOne(id, organizationId);

    const updateData: any = { ...data };

    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        service: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.appointment.delete({
      where: { id },
    });
  }

  async getStats(organizationId: string) {
    const [total, byState, today, tomorrow] = await Promise.all([
      this.prisma.appointment.count({ where: { organizationId } }),
      this.prisma.appointment.groupBy({
        by: ['state'],
        where: { organizationId },
        _count: true,
      }),
      this.prisma.appointment.count({
        where: {
          organizationId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.appointment.count({
        where: {
          organizationId,
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() + 1)),
            lt: new Date(new Date().setDate(new Date().getDate() + 2)),
          },
        },
      }),
    ]);

    return {
      total,
      today,
      tomorrow,
      byState: byState.reduce((acc, item) => {
        acc[item.state] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
