import { Module } from '@nestjs/common';
import { WebChatService } from './webchat.service';
import { WebChatController } from './webchat.controller';
import { AIModule } from '../ai/ai.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AIModule, AuditModule],
  controllers: [WebChatController],
  providers: [WebChatService],
  exports: [WebChatService],
})
export class WebChatModule {}
