import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { MessageProcessorService } from './message-processor.service';
import { AIModule } from '../ai/ai.module';
import { AuditModule } from '../audit/audit.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    HttpModule,
    AIModule,
    AuditModule,
    QueueModule,
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, MessageProcessorService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
