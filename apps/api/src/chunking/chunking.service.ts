import { Injectable } from '@nestjs/common';

type ChunkTextOptions = {
  maxCharacters?: number;
};

type TextChunk = {
  content: string;
  chunkIndex: number;
  characterCount: number;
};

const DEFAULT_MAX_CHARACTERS = 1200;

@Injectable()
export class ChunkingService {
  chunkText(text: string, options: ChunkTextOptions = {}): TextChunk[] {
    const maxCharacters = options.maxCharacters ?? DEFAULT_MAX_CHARACTERS;
    const normalizedText = this.normalizeText(text);

    if (!normalizedText) {
      return [];
    }

    const paragraphs = normalizedText
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (paragraph.length > maxCharacters) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        chunks.push(...this.splitLongParagraph(paragraph, maxCharacters));
        continue;
      }

      const nextChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

      if (nextChunk.length <= maxCharacters) {
        currentChunk = nextChunk;
        continue;
      }

      chunks.push(currentChunk);
      currentChunk = paragraph;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.map((content, chunkIndex) => ({
      content,
      chunkIndex,
      characterCount: content.length,
    }));
  }

  private normalizeText(text: string) {
    return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  private splitLongParagraph(paragraph: string, maxCharacters: number) {
    const chunks: string[] = [];
    let remainingText = paragraph.trim();

    while (remainingText.length > maxCharacters) {
      const splitIndex = this.findSplitIndex(remainingText, maxCharacters);
      const chunk = remainingText.slice(0, splitIndex).trim();

      if (chunk) {
        chunks.push(chunk);
      }

      remainingText = remainingText.slice(splitIndex).trim();
    }

    if (remainingText) {
      chunks.push(remainingText);
    }

    return chunks;
  }

  private findSplitIndex(text: string, maxCharacters: number) {
    const candidate = text.slice(0, maxCharacters);
    const sentenceEndIndex = Math.max(
      candidate.lastIndexOf('. '),
      candidate.lastIndexOf('! '),
      candidate.lastIndexOf('? '),
    );

    if (sentenceEndIndex > maxCharacters * 0.5) {
      return sentenceEndIndex + 1;
    }

    const whitespaceIndex = candidate.lastIndexOf(' ');

    if (whitespaceIndex > maxCharacters * 0.5) {
      return whitespaceIndex;
    }

    return maxCharacters;
  }
}
