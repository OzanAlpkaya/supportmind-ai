import { PrismaClient, ConversationStatus, DocumentStatus, MessageSender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@supportmind.ai' },
    update: {},
    create: {
      email: 'demo@supportmind.ai',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Agent',
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      members: {
        create: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });

  const customer = await prisma.customer.create({
    data: {
      workspaceId: workspace.id,
      email: 'customer@example.com',
      name: 'Example Customer',
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      workspaceId: workspace.id,
      customerId: customer.id,
      subject: 'Refund request',
      status: ConversationStatus.OPEN,
      messages: {
        create: [
          {
            sender: MessageSender.CUSTOMER,
            body: 'Can I get a refund after 10 days?',
          },
        ],
      },
    },
  });

  await prisma.document.createMany({
    data: [
      {
        workspaceId: workspace.id,
        title: 'Refund Policy',
        status: DocumentStatus.PUBLISHED,
        content:
          'Customers can request a refund within 14 days after receiving the product. Refunds are processed within 5 business days after approval. Shipping fees are not refundable unless the product arrived damaged.',
      },
      {
        workspaceId: workspace.id,
        title: 'Shipping Policy',
        status: DocumentStatus.PUBLISHED,
        content:
          'Orders are shipped within 2 business days. Standard delivery usually takes 3 to 5 business days after shipment.',
      },
    ],
  });

  console.log({
    email: user.email,
    password: 'password123',
    workspaceId: workspace.id,
    conversationId: conversation.id,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
