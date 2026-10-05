import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('message-queue') private messageQueue: Queue,
    @InjectQueue('automation-queue') private automationQueue: Queue,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  /**
   * Add message to processing queue
   */
  async addMessageToQueue(messageData: any): Promise<void> {
    await this.messageQueue.add('process-message', messageData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Message added to queue: ${messageData.messageId}`);
  }

  /**
   * Schedule automation job with delay
   */
  async scheduleAutomation(
    automationId: string,
    triggerData: any,
    delayMs: number,
  ): Promise<void> {
    await this.automationQueue.add(
      'execute-automation',
      { automationId, triggerData },
      {
        delay: delayMs,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    this.logger.log(`Automation ${automationId} scheduled with delay ${delayMs}ms`);
  }

  /**
   * Add email to sending queue
   */
  async addEmailToQueue(emailData: any): Promise<void> {
    await this.emailQueue.add('send-email', emailData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    this.logger.log(`Email added to queue for ${emailData.to}`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [messageStats, automationStats, emailStats] = await Promise.all([
      this.messageQueue.getJobCounts(),
      this.automationQueue.getJobCounts(),
      this.emailQueue.getJobCounts(),
    ]);

    return {
      messageQueue: messageStats,
      automationQueue: automationStats,
      emailQueue: emailStats,
    };
  }
}
