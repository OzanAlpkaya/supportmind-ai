import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    userId: string,
    workspaceId: string | undefined,
    dto: CreateConversationDto,
  ) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace id header is required');
    }

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

  async findAll(userId: string, workspaceId: string | undefined) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace id header is required');
    }

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

  async findOne(
    userId: string,
    workspaceId: string | undefined,
    conversationId: string,
  ) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace id header is required');
    }

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
    workspaceId: string | undefined,
    conversationId: string,
    dto: CreateMessageDto,
  ) {
    if (!workspaceId) {
      throw new BadRequestException('Workspace id header is required');
    }

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
}
