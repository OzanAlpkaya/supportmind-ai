import { Injectable, NotFoundException } from '@nestjs/common';
import { ConversationStatus, MessageSender } from '@prisma/client';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly aiService: AiService,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    dto: CreateConversationDto,
  ) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const customer = await this.prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        workspaceId,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found in this workspace');
    }

    return this.prisma.conversation.create({
      data: {
        subject: dto.subject,
        workspaceId,
        customerId: dto.customerId,
      },
      include: {
        customer: true,
      },
    });
  }

  async findAll(userId: string, workspaceId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    return this.prisma.conversation.findMany({
      where: {
        workspaceId,
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(userId: string, workspaceId: string, conversationId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found in this workspace');
    }

    return conversation;
  }

  async createMessage(
    userId: string,
    workspaceId: string,
    conversationId: string,
    dto: CreateMessageDto,
  ) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        workspaceId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found in this workspace');
    }

    const message = await this.prisma.message.create({
      data: {
        body: dto.body,
        sender: dto.sender,
        type: dto.type,
        conversationId,
      },
    });

    await this.prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return message;
  }

  async updateStatus(
    userId: string,
    workspaceId: string,
    conversationId: string,
    status: ConversationStatus,
  ) {
    const conversation = await this.findOne(userId, workspaceId, conversationId);

    return this.prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        status,
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async suggestAiReply(
    userId: string,
    workspaceId: string,
    conversationId: string,
  ) {
    const conversation = await this.findOne(userId, workspaceId, conversationId);
    const latestCustomerMessage = [...conversation.messages]
      .reverse()
      .find((message) => message.sender === MessageSender.CUSTOMER);

    if (!latestCustomerMessage) {
      throw new NotFoundException('No customer message found for this conversation');
    }

    return this.aiService.generateWorkspaceAnswer(
      workspaceId,
      latestCustomerMessage.body,
    );
  }
}
