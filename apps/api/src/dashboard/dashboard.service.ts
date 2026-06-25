import { Injectable } from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async getSummary(userId: string, workspaceId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const [
      totalCustomers,
      totalConversations,
      openConversations,
      pendingConversations,
      resolvedConversations,
      totalDocuments,
      recentConversations,
      recentDocuments,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { workspaceId } }),
      this.prisma.conversation.count({ where: { workspaceId } }),
      this.prisma.conversation.count({
        where: { workspaceId, status: ConversationStatus.OPEN },
      }),
      this.prisma.conversation.count({
        where: { workspaceId, status: ConversationStatus.PENDING },
      }),
      this.prisma.conversation.count({
        where: { workspaceId, status: ConversationStatus.RESOLVED },
      }),
      this.prisma.document.count({ where: { workspaceId } }),
      this.prisma.conversation.findMany({
        where: { workspaceId },
        include: {
          customer: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.prisma.document.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totals: {
        customers: totalCustomers,
        conversations: totalConversations,
        openConversations,
        pendingConversations,
        resolvedConversations,
        documents: totalDocuments,
      },
      recentConversations,
      recentDocuments,
    };
  }
}
