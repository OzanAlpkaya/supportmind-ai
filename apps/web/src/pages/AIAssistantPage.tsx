import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { askAi, type AiAnswerResponse } from '../api/ai';

export function AIAssistantPage() {
  const [question, setQuestion] = useState('Can I get a refund after 10 days?');
  const [result, setResult] = useState<AiAnswerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setError('AI answer could not be generated. Make sure a workspace is selected and chunks exist.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section ai-page">
      <header className="page-header hero-header">
        <div>
          <div className="eyebrow">AI assistant</div>
          <h1>Ask your knowledge base</h1>
          <p>
            Test the full RAG flow: question embedding, pgvector retrieval, prompt building, and
            source-backed answer generation.
          </p>
        </div>
        <Link to="/knowledge-base" className="button button-secondary">
          Manage knowledge base
        </Link>
      </header>

      <div className="ai-layout">
        <section className="panel-card ai-compose-card">
          <div className="panel-heading">
            <div>
              <h2>Question</h2>
              <p>Ask a support policy question. The answer will cite retrieved chunks.</p>
            </div>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field-label">
              Customer question
              <textarea
                value={question}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setQuestion(event.target.value)}
                rows={7}
                placeholder="Can I get a refund after 10 days?"
                required
              />
            </label>

            {error && <p className="alert alert-error">{error}</p>}

            <button type="submit" className="button button-primary" disabled={loading}>
              {loading ? 'Generating answer...' : 'Ask AI'}
            </button>
          </form>
        </section>

        <section className="panel-card ai-answer-card">
          <div className="panel-heading">
            <div>
              <h2>Answer</h2>
              <p>Generated from workspace-scoped knowledge base context.</p>
            </div>
          </div>

          {!result && !loading && (
            <div className="empty-state">
              <strong>No answer yet</strong>
              <span>Submit a question to see the RAG answer and source chunks.</span>
            </div>
          )}

          {loading && <div className="skeleton-card">Retrieving sources and generating answer...</div>}

          {result && (
            <div className="answer-stack">
              <div className="answer-box">
                <span className="answer-label">AI answer</span>
                <p>{result.answer}</p>
              </div>

              <div>
                <h3>Sources</h3>
                {result.sources.length === 0 ? (
                  <div className="empty-state compact">No sources found.</div>
                ) : (
                  <div className="source-list">
                    {result.sources.map((source) => (
                      <article key={source.chunkId} className="source-card">
                        <div className="source-header">
                          <strong>{source.documentTitle}</strong>
                          <span>{Math.round(source.similarityScore * 100)}% match</span>
                        </div>
                        <p>{source.content}</p>
                        <small>Distance {source.distance.toFixed(3)}</small>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
