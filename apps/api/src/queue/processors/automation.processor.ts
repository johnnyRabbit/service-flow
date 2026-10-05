import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { WhatsAppService } from '../../whatsapp/whatsapp.service';

@Processor('automation-queue')
export class AutomationProcessor {
  private readonly logger = new Logger(AutomationProcessor.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private whatsappService: WhatsAppService,
  ) {}

  @Process('execute-automation')
  async handleExecuteAutomation(job: Job): Promise<void> {
    const { automationId, triggerData } = job.data;

    this.logger.log(`Executing automation ${automationId}`);

    try {
      // Get automation rule
      const automation = await this.prisma.automationRule.findUnique({
        where: { id: automationId },
      });

      if (!automation) {
        this.logger.warn(`Automation ${automationId} not found`);
        return;
      }

      if (!automation.enabled) {
        this.logger.log(`Automation ${automationId} is disabled, skipping`);
        return;
      }

      // Execute actions based on automation type
      const actions = automation.actions as string[];

      for (const action of actions) {
        await this.executeAction(action, automation, triggerData);
      }

      this.logger.log(`Automation ${automationId} executed successfully`);
    } catch (error) {
      this.logger.error(`Error executing automation ${automationId}:`, error);
      throw error;
    }
  }

  private async executeAction(
    action: string,
    automation: any,
    triggerData: any,
  ): Promise<void> {
    switch (action) {
      case 'SEND_MESSAGE':
        await this.sendWhatsAppMessage(triggerData, automation);
        break;

      case 'SEND_EMAIL':
        await this.sendEmailNotification(triggerData, automation);
        break;

      case 'NOTIFY_USER':
        await this.notifyUser(triggerData, automation);
        break;

      case 'UPDATE_REQUEST':
        await this.updateRequest(triggerData, automation);
        break;

      default:
        this.logger.warn(`Unknown action: ${action}`);
    }
  }

  private async sendWhatsAppMessage(triggerData: any, automation: any): Promise<void> {
    const { customerPhone, customerName } = triggerData;

    if (!customerPhone) {
      this.logger.warn('No customer phone for SEND_MESSAGE action');
      return;
    }

    const message = this.buildMessage(automation, triggerData);
    await this.whatsappService.sendTextMessage(customerPhone, message);
  }

  private async sendEmailNotification(triggerData: any, automation: any): Promise<void> {
    const { customerEmail, customerName } = triggerData;

    if (!customerEmail) {
      this.logger.warn('No customer email for SEND_EMAIL action');
      return;
    }

    const subject = this.buildSubject(automation, triggerData);
    const html = this.buildEmailHtml(automation, triggerData);

    await this.emailService.sendEmail({
      to: customerEmail,
      subject,
      html,
    });
  }

  private async notifyUser(triggerData: any, automation: any): Promise<void> {
    // Notify assigned user or team
    const { assignedUserId, organizationId } = triggerData;

    if (!assignedUserId) {
      this.logger.warn('No assigned user for NOTIFY_USER action');
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: assignedUserId },
    });

    if (user && user.email) {
      await this.emailService.sendEmail({
        to: user.email,
        subject: `Notificação: ${automation.name}`,
        html: `<p>Uma automação foi executada e requer a sua atenção.</p>`,
      });
    }
  }

  private async updateRequest(triggerData: any, automation: any): Promise<void> {
    const { requestId } = triggerData;

    if (!requestId) {
      this.logger.warn('No request ID for UPDATE_REQUEST action');
      return;
    }

    // Update request state based on automation
    await this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        state: 'REVIEWING',
      },
    });
  }

  private buildMessage(automation: any, triggerData: any): string {
    // Build dynamic message based on automation and trigger data
    const { customerName, serviceName } = triggerData;

    if (automation.name.includes('Follow-up')) {
      return `Olá ${customerName}, ainda precisa de ajuda com o ${serviceName}? Estamos disponíveis para ajudar!`;
    }

    if (automation.name.includes('Lembrete')) {
      return `Lembrete: A sua marcação para ${serviceName} está agendada. Confirme a sua presença.`;
    }

    return `Olá ${customerName}, temos uma atualização sobre o seu pedido.`;
  }

  private buildSubject(automation: any, triggerData: any): string {
    return `${automation.name} - ServiceFlow AI`;
  }

  private buildEmailHtml(automation: any, triggerData: any): string {
    const message = this.buildMessage(automation, triggerData);
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${automation.name}</h2>
        <p>${message}</p>
        <p>Obrigado,<br/>Equipa ServiceFlow AI</p>
      </div>
    `;
  }
}
