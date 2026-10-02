import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, filters?: {
    state?: string;
    customerId?: string;
    assignedUserId?: string;
  }) {
    return this.prisma.conversation.findMany({
      where: {
        organizationId,
        ...(filters?.state && { state: filters.state as any }),
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.assignedUserId && { assignedUserId: filters.assignedUserId }),
      },
      include: {
        customer: true,
        assignedUser: true,
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id, organizationId },
      include: {
        customer: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        assignedUser: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async updateState(organizationId: string, id: string, state: string, assignedUserId?: string) {
    await this.findOne(organizationId, id);

    return this.prisma.conversation.update({
      where: { id },
      data: {
        state: state as any,
        ...(assignedUserId && { assignedUserId }),
        humanTakeover: state === 'HUMAN_ACTIVE',
      },
    });
  }
}
