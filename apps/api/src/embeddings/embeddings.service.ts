import { Injectable } from '@nestjs/common';

const DEFAULT_EMBEDDING_DIMENSION = 1536;

@Injectable()
export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    const seed = this.createDeterministicSeed(text);

    return Array.from({ length: DEFAULT_EMBEDDING_DIMENSION }, (_, index) => {
      const value = Math.sin(seed + index) * 10000;
      return Number((value - Math.floor(value)).toFixed(6));
    });
  }

  private createDeterministicSeed(text: string) {
    return text.split('').reduce((hash, character) => {
      return (hash * 31 + character.charCodeAt(0)) % 100000;
    }, 7);
  }
}
