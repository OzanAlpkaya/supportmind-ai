import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspaceMember.findMany({
      where: {
        userId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findCurrentForUser(userId: string) {
    return this.prisma.workspaceMember.findFirst({
      where: {
        userId,
      },
      include: {
        workspace: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findMembershipOrThrow(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Workspace not found');
    }

    return membership;
  }

  async ensureOwner(userId: string, workspaceId: string) {
    const membership = await this.findMembershipOrThrow(userId, workspaceId);

    if (membership.role !== WorkspaceRole.OWNER) {
      throw new ForbiddenException(
        'Only workspace owners can perform this action',
      );
    }

    return membership;
  }
}
