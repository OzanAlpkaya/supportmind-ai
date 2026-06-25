import { Module } from '@nestjs/common';
import { ChunkingModule } from '../chunking/chunking.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [PrismaModule, WorkspacesModule, ChunkingModule, EmbeddingsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
