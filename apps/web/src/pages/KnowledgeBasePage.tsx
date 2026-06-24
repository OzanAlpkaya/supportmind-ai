import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getDocuments, type Document } from '../api/documents';

export function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocuments() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, []);

  return (
    <div>
      <h1>Knowledge Base</h1>

      <p>Create and manage support documents for the current workspace.</p>

      <p>
        <Link to="/knowledge-base/new">Create document</Link>
      </p>

      {loading && <p>Loading documents...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && documents.length === 0 && (
        <p>No documents yet. Create your first knowledge base document.</p>
      )}

      {!loading && !error && documents.length > 0 && (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <Link to={`/knowledge-base/${document.id}`}>{document.title}</Link>
              <span> — {document.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
