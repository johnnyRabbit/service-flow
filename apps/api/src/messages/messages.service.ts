import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto, GetMessagesDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findByConversation(
    conversationId: string,
    organizationId: string,
    options: GetMessagesDto = {},
  ) {
    // Verify conversation belongs to organization
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    const { limit = 50, offset = 0, order = 'asc' } = options;

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: order },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, organizationId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          select: { organizationId: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (message.conversation.organizationId !== organizationId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    return message;
  }

  async create(data: CreateMessageDto, organizationId: string) {
    // Verify conversation belongs to organization
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: data.conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${data.conversationId} not found`);
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderType: data.senderType,
        senderName: data.senderName,
        content: data.content,
        attachments: data.attachments || [],
        metadata: data.metadata,
      },
    });

    // Update conversation last message
    await this.prisma.conversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessage: data.content,
        lastMessageAt: new Date(),
        ...(data.senderType === 'CUSTOMER' && {
          unreadCount: { increment: 1 },
        }),
      },
    });

    return message;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.message.delete({
      where: { id },
    });
  }

  async markAsRead(conversationId: string, organizationId: string) {
    // Verify conversation belongs to organization
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, organizationId },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });
  }
}
