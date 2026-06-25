import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments, type Document, type DocumentStatus } from '../api/documents';

function getStatusLabel(status: DocumentStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const publishedCount = useMemo(
    () => documents.filter((document) => document.status === 'PUBLISHED').length,
    [documents],
  );

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch {
        setError('Failed to load documents.');
      } finally {
        setLoading(false);
      }
    }

    void loadDocuments();
  }, []);

  return (
    <section className="page-section">
      <header className="page-header hero-header">
        <div>
          <div className="eyebrow">Knowledge base</div>
          <h1>Source of truth for AI answers</h1>
          <p>
            Manage workspace documents that power chunking, embeddings, retrieval, and source-backed
            AI responses.
          </p>
        </div>
        <Link to="/knowledge-base/new" className="button button-primary">
          Create document
        </Link>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total documents</span>
          <strong>{documents.length}</strong>
        </div>
        <div className="stat-card">
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>
        <div className="stat-card">
          <span>Draft or archived</span>
          <strong>{documents.length - publishedCount}</strong>
        </div>
      </div>

      {loading && <div className="skeleton-card">Loading documents...</div>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <div className="empty-state large">
          <strong>No documents yet</strong>
          <span>Create your first knowledge base article to start powering RAG answers.</span>
          <Link to="/knowledge-base/new" className="button button-primary">
            Create first document
          </Link>
        </div>
      )}

      {!loading && !error && documents.length > 0 && (
        <div className="document-grid">
          {documents.map((document) => (
            <Link key={document.id} to={`/knowledge-base/${document.id}`} className="document-card">
              <div className="document-card-header">
                <span className={`status-badge status-${document.status.toLowerCase()}`}>
                  {getStatusLabel(document.status)}
                </span>
                <small>{new Date(document.updatedAt).toLocaleDateString()}</small>
              </div>
              <h2>{document.title}</h2>
              <p>{document.content.slice(0, 180)}{document.content.length > 180 ? '...' : ''}</p>
              <span className="card-link">Open document →</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
