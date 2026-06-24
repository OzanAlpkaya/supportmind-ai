import { Injectable, NotFoundException } from '@nestjs/common';
import { ChunkingService } from '../chunking/chunking.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async create(userId: string, workspaceId: string, createDocumentDto: CreateDocumentDto) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    return this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        content: createDocumentDto.content,
        status: createDocumentDto.status,
        workspaceId,
      },
    });
  }

  async findAll(userId: string, workspaceId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    return this.prisma.document.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, workspaceId: string, documentId: string) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        workspaceId,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(
    userId: string,
    workspaceId: string,
    documentId: string,
    updateDocumentDto: UpdateDocumentDto,
  ) {
    const document = await this.findOne(userId, workspaceId, documentId);

    return this.prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        title: updateDocumentDto.title,
        content: updateDocumentDto.content,
        status: updateDocumentDto.status,
      },
    });
  }

  async remove(userId: string, workspaceId: string, documentId: string) {
    const document = await this.findOne(userId, workspaceId, documentId);

    return this.prisma.document.delete({
      where: {
        id: document.id,
      },
    });
  }

  async rebuildChunks(userId: string, workspaceId: string, documentId: string) {
    const document = await this.findOne(userId, workspaceId, documentId);
    const chunks = this.chunkingService.chunkText(document.content);

    return this.prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({
        where: {
          documentId: document.id,
          workspaceId,
        },
      });

      if (chunks.length === 0) {
        return [];
      }

      await tx.documentChunk.createMany({
        data: chunks.map((chunk) => ({
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          characterCount: chunk.characterCount,
          documentId: document.id,
          workspaceId,
        })),
      });

      return tx.documentChunk.findMany({
        where: {
          documentId: document.id,
          workspaceId,
        },
        orderBy: {
          chunkIndex: 'asc',
        },
      });
    });
  }

  async findChunks(userId: string, workspaceId: string, documentId: string) {
    const document = await this.findOne(userId, workspaceId, documentId);

    return this.prisma.documentChunk.findMany({
      where: {
        documentId: document.id,
        workspaceId,
      },
      orderBy: {
        chunkIndex: 'asc',
      },
    });
  }
}
