import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationRuleDto, UpdateAutomationRuleDto } from './dto/automation.dto';

@Injectable()
export class AutomationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, includeDisabled = false) {
    return this.prisma.automationRule.findMany({
      where: {
        organizationId,
        ...(includeDisabled ? {} : { enabled: true }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: { id, organizationId },
    });

    if (!rule) {
      throw new NotFoundException(`Automation rule with ID ${id} not found`);
    }

    return rule;
  }

  async create(organizationId: string, data: CreateAutomationRuleDto) {
    return this.prisma.automationRule.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        conditions: data.conditions || [],
        actions: data.actions || [],
        delay: data.delay || 0,
        delayUnit: data.delayUnit || 'MINUTES',
        enabled: data.enabled !== undefined ? data.enabled : true,
      },
    });
  }

  async update(id: string, organizationId: string, data: UpdateAutomationRuleDto) {
    await this.findOne(id, organizationId);

    return this.prisma.automationRule.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.automationRule.delete({
      where: { id },
    });
  }

  async toggle(id: string, organizationId: string) {
    const rule = await this.findOne(id, organizationId);

    return this.prisma.automationRule.update({
      where: { id },
      data: { enabled: !rule.enabled },
    });
  }

  async findByTrigger(organizationId: string, trigger: string) {
    return this.prisma.automationRule.findMany({
      where: {
        organizationId,
        trigger,
        enabled: true,
      },
    });
  }
}
