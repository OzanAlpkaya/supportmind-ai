import { Injectable } from '@nestjs/common';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { PrismaService } from '../prisma/prisma.service';

export type RelevantChunk = {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  distance: number;
};

@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async findRelevantChunks(
    workspaceId: string,
    question: string,
    limit = 5,
  ): Promise<RelevantChunk[]> {
    const embedding = await this.embeddingsService.generateEmbedding(question);
    const embeddingSql = `[${embedding.join(',')}]`;

    return this.prisma.$queryRaw<RelevantChunk[]>`
      SELECT
        dc."id" AS "chunkId",
        dc."documentId" AS "documentId",
        d."title" AS "documentTitle",
        dc."content" AS "content",
        dc."embedding" <-> ${embeddingSql}::vector AS "distance"
      FROM "DocumentChunk" dc
      INNER JOIN "Document" d ON d."id" = dc."documentId"
      WHERE dc."workspaceId" = ${workspaceId}
        AND dc."embedding" IS NOT NULL
      ORDER BY dc."embedding" <-> ${embeddingSql}::vector
      LIMIT ${limit}
    `;
  }
}
