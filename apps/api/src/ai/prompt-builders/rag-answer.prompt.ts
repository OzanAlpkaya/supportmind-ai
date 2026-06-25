import type { RelevantChunk } from '../../retrieval/retrieval.service';

type BuildRagAnswerPromptParams = {
  question: string;
  chunks: RelevantChunk[];
};

export function buildRagAnswerPrompt({
  question,
  chunks,
}: BuildRagAnswerPromptParams) {
  const context = chunks
    .map((chunk, index) => {
      return [
        `Source ${index + 1}`,
        `Document: ${chunk.documentTitle}`,
        `Content: ${chunk.content}`,
      ].join('\n');
    })
    .join('\n\n---\n\n');

  return [
    'You are SupportMind AI, a helpful customer support assistant.',
    '',
    'Answer the user question using only the knowledge base context below.',
    'If the answer is not available in the context, say that you do not know based on the available knowledge base.',
    'Do not invent policies, dates, prices, guarantees, or procedures.',
    'Keep the answer concise and clear.',
    '',
    'Knowledge base context:',
    context || 'No relevant context was found.',
    '',
    `User question: ${question}`,
  ].join('\n');
}
