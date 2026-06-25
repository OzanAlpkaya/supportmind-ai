import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RelevantChunk, RetrievalService } from '../retrieval/retrieval.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { buildRagAnswerPrompt } from './prompt-builders/rag-answer.prompt';

export type AiAnswerSource = RelevantChunk & {
  similarityScore: number;
};

export type AiAnswerResult = {
  answer: string;
  sources: AiAnswerSource[];
};

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly chatModel: string;

  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly workspacesService: WorkspacesService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.chatModel = this.configService.get<string>('OPENAI_CHAT_MODEL') ?? 'gpt-5.5';
  }

  async answerQuestion(
    userId: string,
    workspaceId: string,
    question: string,
  ): Promise<AiAnswerResult> {
    await this.workspacesService.findMembershipOrThrow(userId, workspaceId);

    return this.generateWorkspaceAnswer(workspaceId, question);
  }

  async generateWorkspaceAnswer(
    workspaceId: string,
    question: string,
  ): Promise<AiAnswerResult> {
    const relevantChunks = await this.retrievalService.findRelevantChunks(
      workspaceId,
      question,
    );

    if (relevantChunks.length === 0) {
      return {
        answer: 'I do not know based on the available knowledge base.',
        sources: [],
      };
    }

    const prompt = buildRagAnswerPrompt({
      question,
      chunks: relevantChunks,
    });

    const response = await this.openai.responses.create({
      model: this.chatModel,
      input: prompt,
    });

    const answer = response.output_text;

    if (!answer) {
      throw new InternalServerErrorException('Failed to generate AI answer');
    }

    return {
      answer,
      sources: this.formatSources(relevantChunks),
    };
  }

  private formatSources(chunks: RelevantChunk[]): AiAnswerSource[] {
    return chunks.map((chunk) => ({
      ...chunk,
      similarityScore: 1 / (1 + chunk.distance),
    }));
  }
}
