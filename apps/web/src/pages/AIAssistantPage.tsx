import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { askAi, type AiAnswerResponse } from '../api/ai';

export function AIAssistantPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<AiAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleQuestionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setQuestion(event.target.value);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!question.trim()) {
      setError('Question is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await askAi(question);
      setResult(data);
    } catch {
      setError('AI answer could not be generated.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>Ask questions against your published knowledge base documents.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card stack">
        <label htmlFor="question">Question</label>
        <textarea
          id="question"
          value={question}
          onChange={handleQuestionChange}
          rows={5}
          placeholder="Can I get a refund after 10 days?"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Asking...' : 'Ask AI'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && (
        <section className="card stack">
          <h2>Answer</h2>
          <p>{result.answer}</p>

          <h3>Sources</h3>
          {result.sources.length === 0 ? (
            <p>No sources found.</p>
          ) : (
            <ul className="source-list">
              {result.sources.map((source) => (
                <li key={source.chunkId}>
                  <strong>{source.documentTitle}</strong>
                  <p>{source.content}</p>
                  <small>
                    Similarity: {Math.round(source.similarityScore * 100)}% · Distance:{' '}
                    {source.distance.toFixed(3)}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}
