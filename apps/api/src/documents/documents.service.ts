import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentStatus } from '@prisma/client';
import { ChunkingService } from '../chunking/chunking.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
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
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    createDocumentDto: CreateDocumentDto,
  ) {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    const document = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        content: createDocumentDto.content,
        status: createDocumentDto.status,
        workspaceId,
      },
    });

    if (document.status === DocumentStatus.PUBLISHED) {
      await this.rebuildChunksForDocument(document.id, workspaceId, document.content);
    }

    return document;
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

    const updatedDocument = await this.prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        title: updateDocumentDto.title,
        content: updateDocumentDto.content,
        status: updateDocumentDto.status,
      },
    });

    if (updatedDocument.status === DocumentStatus.PUBLISHED) {
      await this.rebuildChunksForDocument(
        updatedDocument.id,
        workspaceId,
        updatedDocument.content,
      );
    } else {
      await this.prisma.documentChunk.deleteMany({
        where: {
          documentId: updatedDocument.id,
          workspaceId,
        },
      });
    }

    return updatedDocument;
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

    return this.rebuildChunksForDocument(document.id, workspaceId, document.content);
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

  private async rebuildChunksForDocument(
    documentId: string,
    workspaceId: string,
    content: string,
  ) {
    const chunks = this.chunkingService.chunkText(content);

    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => ({
        id: randomUUID(),
        content: chunk.content,
        chunkIndex: chunk.chunkIndex,
        characterCount: chunk.characterCount,
        embedding: await this.embeddingsService.generateEmbedding(chunk.content),
      })),
    );

    return this.prisma.$transaction(async (tx) => {
      await tx.documentChunk.deleteMany({
        where: {
          documentId,
          workspaceId,
        },
      });

      for (const chunk of chunksWithEmbeddings) {
        const embeddingSql = `[${chunk.embedding.join(',')}]`;

        await tx.$executeRaw`
          INSERT INTO "DocumentChunk" (
            "id",
            "content",
            "chunkIndex",
            "characterCount",
            "createdAt",
            "updatedAt",
            "documentId",
            "workspaceId",
            "embedding"
          )
          VALUES (
            ${chunk.id},
            ${chunk.content},
            ${chunk.chunkIndex},
            ${chunk.characterCount},
            NOW(),
            NOW(),
            ${documentId},
            ${workspaceId},
            ${embeddingSql}::vector
          )
        `;
      }

      return tx.documentChunk.findMany({
        where: {
          documentId,
          workspaceId,
        },
        orderBy: {
          chunkIndex: 'asc',
        },
      });
    });
  }
}
