import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Create Organization
  console.log('📦 Creating organization...');
  const organization = await prisma.organization.upsert({
    where: { id: 'org_demo' },
    update: {},
    create: {
      id: 'org_demo',
      name: 'ClimaTech AVAC',
      phone: '+351 912 345 678',
      email: 'geral@climatech.pt',
      timezone: 'Europe/Lisbon',
      autonomyLevel: 2,
      businessHours: {
        monday: { open: '08:00', close: '18:00', closed: false },
        tuesday: { open: '08:00', close: '18:00', closed: false },
        wednesday: { open: '08:00', close: '18:00', closed: false },
        thursday: { open: '08:00', close: '18:00', closed: false },
        friday: { open: '08:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '13:00', closed: false },
        sunday: { open: '', close: '', closed: true },
      },
      serviceZones: ['Lisboa', 'Sintra', 'Cascais', 'Oeiras'],
    },
  });
  console.log(`✅ Organization created: ${organization.name}\n`);

  // 2. Create Users
  console.log('👥 Creating users...');
  
  const passwordHash = await bcrypt.hash('demo123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@climatech.pt' },
    update: {},
    create: {
      id: 'user_admin',
      organizationId: organization.id,
      email: 'admin@climatech.pt',
      passwordHash,
      name: 'Admin ClimaTech',
      role: 'OWNER',
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'carlos@climatech.pt' },
    update: {},
    create: {
      id: 'user_tech',
      organizationId: organization.id,
      email: 'carlos@climatech.pt',
      passwordHash,
      name: 'Carlos Técnico',
      role: 'TECHNICIAN',
    },
  });

  console.log(`✅ Users created: ${admin.name}, ${technician.name}\n`);

  // 3. Create Services
  console.log('🔧 Creating services...');

  const service1 = await prisma.service.upsert({
    where: { id: 'svc_ac_repair' },
    update: {},
    create: {
      id: 'svc_ac_repair',
      organizationId: organization.id,
      name: 'Reparação Ar Condicionado',
      description: 'Diagnóstico e reparação de sistemas de ar condicionado',
      icon: 'Snowflake',
      requiredFields: [
        { key: 'brand', label: 'Marca', type: 'SELECT', required: true, options: ['Daikin', 'Mitsubishi', 'Samsung', 'LG', 'Panasonic', 'Outra'] },
        { key: 'model', label: 'Modelo', type: 'TEXT', required: true },
        { key: 'symptoms', label: 'Sintomas', type: 'MULTISELECT', required: true, options: ['Não arrefece', 'Não aquece', 'Faz ruído', 'Pinga água', 'Cheiro estranho', 'Não liga', 'Outro'] },
        { key: 'address', label: 'Morada', type: 'TEXT', required: true },
      ],
      optionalFields: [
        { key: 'errorCode', label: 'Código de Erro', type: 'TEXT', required: false },
      ],
      rules: [
        { id: 'rule_1', condition: 'symptoms contains "Cheiro estranho"', action: 'HUMAN_HANDOFF', description: 'Handoff imediato se cheiro a queimado' },
      ],
      estimatedDuration: 120,
      basePrice: 75,
    },
  });

  const service2 = await prisma.service.upsert({
    where: { id: 'svc_maintenance' },
    update: {},
    create: {
      id: 'svc_maintenance',
      organizationId: organization.id,
      name: 'Manutenção Preventiva AC',
      description: 'Limpeza e verificação periódica de sistemas',
      icon: 'Wrench',
      requiredFields: [
        { key: 'brand', label: 'Marca', type: 'SELECT', required: true, options: ['Daikin', 'Mitsubishi', 'Samsung', 'LG', 'Panasonic', 'Outra'] },
        { key: 'units', label: 'Nº de Unidades', type: 'NUMBER', required: true },
        { key: 'address', label: 'Morada', type: 'TEXT', required: true },
      ],
      optionalFields: [],
      rules: [],
      estimatedDuration: 90,
      basePrice: 50,
    },
  });

  console.log(`✅ Services created: ${service1.name}, ${service2.name}\n`);

  // 4. Create Customers
  console.log('👤 Creating customers...');

  const customer1 = await prisma.customer.upsert({
    where: { id: 'cust_maria' },
    update: {},
    create: {
      id: 'cust_maria',
      organizationId: organization.id,
      name: 'Maria Santos',
      phone: '+351 913 456 789',
      email: 'maria@email.com',
      address: 'Rua das Flores 23, Lisboa',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 'cust_joao' },
    update: {},
    create: {
      id: 'cust_joao',
      organizationId: organization.id,
      name: 'João Ferreira',
      phone: '+351 914 567 890',
      email: 'joao@email.com',
      address: 'Av. da Liberdade 100, Sintra',
    },
  });

  console.log(`✅ Customers created: ${customer1.name}, ${customer2.name}\n`);

  // 5. Create Sample Conversation
  console.log('💬 Creating sample conversation...');

  const conversation = await prisma.conversation.create({
     {
      id: 'conv_sample',
      organizationId: organization.id,
      customerId: customer1.id,
      channel: 'WHATSAPP',
      state: 'AI_ACTIVE',
      aiEnabled: true,
      humanTakeover: false,
      lastMessage: 'O meu ar condicionado não arrefece nada',
      lastMessageAt: new Date(),
      unreadCount: 1,
      priority: 'NORMAL',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderType: 'CUSTOMER',
        senderName: customer1.name,
        content: 'Olá, preciso de ajuda com o meu ar condicionado',
      },
      {
        conversationId: conversation.id,
        senderType: 'AI',
        senderName: 'Assistente IA',
        content: 'Olá Maria! Posso ajudar. Qual é a marca do seu ar condicionado?',
      },
      {
        conversationId: conversation.id,
        senderType: 'CUSTOMER',
        senderName: customer1.name,
        content: 'É um Daikin, modelo FTXM25',
      },
      {
        conversationId: conversation.id,
        senderType: 'AI',
        senderName: 'Assistente IA',
        content: 'Obrigada! E o que está a acontecer? Não arrefece, faz ruído, pinga água?',
      },
      {
        conversationId: conversation.id,
        senderType: 'CUSTOMER',
        senderName: customer1.name,
        content: 'O meu ar condicionado não arrefece nada',
      },
    ],
  });

  console.log(`✅ Conversation created with 5 messages\n`);

  // 6. Create Automation Rules
  console.log('⚡ Creating automation rules...');

  await prisma.automationRule.createMany({
    data: [
      {
        organizationId: organization.id,
        name: 'Follow-up após orçamento',
        description: 'Quando um orçamento é enviado, aguardar 48h. Se o cliente não responder, enviar mensagem de follow-up.',
        trigger: 'QUOTE_SENT',
        conditions: ['Sem resposta do cliente'],
        actions: ['SEND_MESSAGE'],
        delay: 48,
        delayUnit: 'HOURS',
        enabled: true,
      },
      {
        organizationId: organization.id,
        name: 'Lembrete de marcação',
        description: 'Enviar lembrete ao cliente 24h antes da marcação agendada.',
        trigger: 'APPOINTMENT_CREATED',
        conditions: ['24h antes da marcação'],
        actions: ['SEND_MESSAGE', 'SEND_EMAIL'],
        delay: 24,
        delayUnit: 'HOURS',
        enabled: true,
      },
    ],
  });

  console.log(`✅ Automation rules created\n`);

  console.log('🎉 Database seed completed successfully!\n');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@climatech.pt / demo123');
  console.log('   Tech:  carlos@climatech.pt / demo123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
