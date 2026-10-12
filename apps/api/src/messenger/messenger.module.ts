import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MessengerService } from './messenger.service';
import { MessengerController } from './messenger.controller';
import { AIModule } from '../ai/ai.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [HttpModule, AIModule, AuditModule],
  controllers: [MessengerController],
  providers: [MessengerService],
  exports: [MessengerService],
})
export class MessengerModule {}
