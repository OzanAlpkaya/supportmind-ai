import { Module } from '@nestjs/common';
import { RetrievalModule } from '../retrieval/retrieval.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [RetrievalModule, WorkspacesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
