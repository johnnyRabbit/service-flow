import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ServicesModule } from './services/services.module';
import { RequestsModule } from './requests/requests.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AutomationsModule } from './automations/automations.module';
import { AIModule } from './ai/ai.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { AuditModule } from './audit/audit.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Scheduled tasks
    ScheduleModule.forRoot(),

    // Core modules
    PrismaModule,
    AuthModule,
    
    // Organization management
    OrganizationsModule,
    UsersModule,
    
    // Business logic
    CustomersModule,
    ServicesModule,
    RequestsModule,
    ConversationsModule,
    MessagesModule,
    AppointmentsModule,
    
    // Automation & AI
    AutomationsModule,
    AIModule,
    QueueModule,
    
    // Integrations
    WhatsAppModule,
    WebhooksModule,
    
    // Monitoring
    AuditModule,
  ],
})
export class AppModule {}
