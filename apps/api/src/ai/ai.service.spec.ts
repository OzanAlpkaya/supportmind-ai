import { AiService } from './ai.service';

describe('AiService', () => {
  it('returns fallback answer when no relevant chunks are found', async () => {
    const retrievalService = {
      findRelevantChunks: jest.fn().mockResolvedValue([]),
    };
    const workspacesService = {
      findMembershipOrThrow: jest.fn().mockResolvedValue({}),
    };
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'OPENAI_API_KEY') {
          return 'test-key';
        }
        return undefined;
      }),
    };

    const service = new AiService(
      retrievalService as never,
      workspacesService as never,
      configService as never,
    );

    const result = await service.answerQuestion('user-id', 'workspace-id', 'Unknown?');

    expect(result).toEqual({
      answer: 'I do not know based on the available knowledge base.',
      sources: [],
    });
  });
});
