import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private readonly openai: OpenAI;
  private readonly embeddingModel: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENAI_API_KEY is not configured',
      );
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.embeddingModel =
      this.configService.get<string>('OPENAI_EMBEDDING_MODEL') ??
      'text-embedding-3-small';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      return [];
    }

    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: normalizedText,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new InternalServerErrorException('Failed to generate embedding');
    }

    return embedding;
  }
}
