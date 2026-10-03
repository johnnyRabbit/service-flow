import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  organizationId: string;
  actorType: 'USER' | 'AI' | 'SYSTEM';
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: any;
  after?: any;
  correlationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Log an action to the audit trail
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
         {
          organizationId: entry.organizationId,
          actorType: entry.actorType,
          actorId: entry.actorId,
          actorName: entry.actorName,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          before: entry.before || undefined,
          after: entry.after || undefined,
          correlationId: entry.correlationId,
        },
      });

      this.logger.debug(`Audit log: ${entry.actorName} ${entry.action} ${entry.entityType} ${entry.entityId}`);
    } catch (error) {
      this.logger.error('Error creating audit log:', error);
      // Don't throw - audit log failures shouldn't break the main flow
    }
  }

  /**
   * Get audit logs for an organization
   */
  async getLogs(
    organizationId: string,
    filters?: {
      actorType?: string;
      entityType?: string;
      entityId?: string;
      action?: string;
      limit?: number;
    },
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        ...(filters?.actorType && { actorType: filters.actorType as any }),
        ...(filters?.entityType && { entityType: filters.entityType }),
        ...(filters?.entityId && { entityId: filters.entityId }),
        ...(filters?.action && { action: filters.action }),
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });
  }
}
