import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { MessageProcessor } from './processors/message.processor';
import { AutomationProcessor } from './processors/automation.processor';
import { EmailProcessor } from './processors/email.processor';
import { AIModule } from '../ai/ai.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { EmailModule } from '../email/email.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const redisToken = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

        // If Upstash is configured, use it
        if (redisUrl && redisToken) {
          return {
            redis: {
              host: new URL(redisUrl).hostname,
              port: 6379,
              password: redisToken,
              tls: {},
            },
          };
        }

        // Fallback to local Redis for development
        return {
          redis: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: 'message-queue' },
      { name: 'automation-queue' },
      { name: 'email-queue' },
    ),
    AIModule,
    WhatsAppModule,
    EmailModule,
    AuditModule,
  ],
  providers: [QueueService, MessageProcessor, AutomationProcessor, EmailProcessor],
  exports: [QueueService],
})
export class QueueModule {}
