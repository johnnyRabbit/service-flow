import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL', 'noreply@serviceflow.ai');

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured, email features will be disabled');
    }

    this.resend = new Resend(apiKey || 'dummy');
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: recipients,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      this.logger.log(`Email sent to ${recipients.join(', ')}: ${response.id}`);
      return response;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send new request notification to technician
   */
  async sendNewRequestNotification(
    technicianEmail: string,
    customerName: string,
    serviceName: string,
    requestId: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Novo Pedido Recebido</h2>
        <p>Olá,</p>
        <p>Um novo pedido foi criado e precisa da sua atenção:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>ID do Pedido:</strong> ${requestId}</p>
        </div>
        <p>Por favor, aceda ao dashboard para mais detalhes.</p>
        <p>Obrigado,<br/>Equipa ServiceFlow AI</p>
      </div>
    `;

    await this.sendEmail({
      to: technicianEmail,
      subject: `Novo Pedido: ${customerName} - ${serviceName}`,
      html,
    });
  }

  /**
   * Send appointment confirmation to customer
   */
  async sendAppointmentConfirmation(
    customerEmail: string,
    customerName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Confirmação de Marcação</h2>
        <p>Olá ${customerName},</p>
        <p>A sua marcação foi confirmada com sucesso:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        <p>Se precisar de alterar ou cancelar, por favor contacte-nos.</p>
        <p>Obrigado,<br/>Equipa ServiceFlow AI</p>
      </div>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Confirmação de Marcação - ${date} às ${time}`,
      html,
    });
  }

  /**
   * Send appointment reminder (24h before)
   */
  async sendAppointmentReminder(
    customerEmail: string,
    customerName: string,
    serviceName: string,
    date: string,
    time: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Lembrete de Marcação</h2>
        <p>Olá ${customerName},</p>
        <p>Este é um lembrete da sua marcação de amanhã:</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Serviço:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Hora:</strong> ${time}</p>
        </div>
        <p>Se precisar de alterar ou cancelar, por favor contacte-nos o mais breve possível.</p>
        <p>Obrigado,<br/>Equipa ServiceFlow AI</p>
      </div>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Lembrete: Marcação amanhã às ${time}`,
      html,
    });
  }

  /**
   * Send human handoff notification to team
   */
  async sendHandoffNotification(
    teamEmail: string,
    customerName: string,
    conversationId: string,
    reason: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">⚠️ Handoff para Humano Necessário</h2>
        <p>Olá,</p>
        <p>Uma conversa requer intervenção humana:</p>
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Cliente:</strong> ${customerName}</p>
          <p><strong>Motivo:</strong> ${reason}</p>
          <p><strong>ID da Conversa:</strong> ${conversationId}</p>
        </div>
        <p>Por favor, aceda ao dashboard para assumir a conversa.</p>
        <p>Obrigado,<br/>ServiceFlow AI</p>
      </div>
    `;

    await this.sendEmail({
      to: teamEmail,
      subject: `⚠️ Handoff Necessário: ${customerName}`,
      html,
    });
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured(): boolean {
    return !!this.configService.get<string>('RESEND_API_KEY');
  }
}
