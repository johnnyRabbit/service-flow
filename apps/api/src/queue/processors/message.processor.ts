import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { MessageProcessorService } from '../../whatsapp/message-processor.service';

@Processor('message-queue')
export class MessageProcessor {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor(private messageProcessorService: MessageProcessorService) {}

  @Process('process-message')
  async handleProcessMessage(job: Job): Promise<void> {
    const { messageId, from, text, timestamp, metadata } = job.data;

    this.logger.log(`Processing message ${messageId} from ${from}`);

    try {
      await this.messageProcessorService.processIncomingMessage({
        messageId,
        from,
        text,
        timestamp,
        metadata,
      });

      this.logger.log(`Message ${messageId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing message ${messageId}:`, error);
      throw error;
    }
  }
}
