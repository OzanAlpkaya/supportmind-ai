import { ChunkingService } from './chunking.service';

describe('ChunkingService', () => {
  it('splits long text into chunks', () => {
    const service = new ChunkingService();
    const text = ['Paragraph one.', 'Paragraph two.', 'Paragraph three.'].join('\n\n');

    const chunks = service.chunkText(text);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].characterCount).toBe(chunks[0].content.length);
  });

  it('returns an empty array for blank text', () => {
    const service = new ChunkingService();

    expect(service.chunkText('   ')).toEqual([]);
  });
});
