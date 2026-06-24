import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { deleteDocument, getDocument, type Document } from '../api/documents';

export function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadDocument() {
      if (!id) {
        setError('Document id not found');
        setLoading(false);
        return;
      }

      try {
        const data = await getDocument(id);
        setDocument(data);
      } catch {
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [id]);

  async function handleDelete() {
    if (!document) {
      return;
    }

    const confirmed = window.confirm(`Delete "${document.title}"?`);

    if (!confirmed) {
      return;
    }

    setError('');
    setDeleting(true);

    try {
      await deleteDocument(document.id);
      navigate('/knowledge-base');
    } catch {
      setError('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <p>Loading document...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <p>
          <Link to="/knowledge-base">Back to Knowledge Base</Link>
        </p>
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <p>Document not found.</p>
        <p>
          <Link to="/knowledge-base">Back to Knowledge Base</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/knowledge-base">Back to Knowledge Base</Link>
      </p>

      <h1>{document.title}</h1>

      <p>Status: {document.status}</p>

      <p>
        <Link to={`/knowledge-base/${document.id}/edit`}>Edit document</Link>
      </p>

      <p>
        <button type="button" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete document'}
        </button>
      </p>

      <section>
        <h2>Content</h2>
        <p>{document.content}</p>
      </section>

      <section>
        <h2>Metadata</h2>
        <p>Created at: {new Date(document.createdAt).toLocaleString()}</p>
        <p>Updated at: {new Date(document.updatedAt).toLocaleString()}</p>
      </section>
    </div>
  );
}
