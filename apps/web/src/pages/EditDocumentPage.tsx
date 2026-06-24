import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getDocument, updateDocument, type DocumentStatus } from '../api/documents';

export function EditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('DRAFT');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocument() {
      if (!id) {
        setError('Document id not found');
        setLoading(false);
        return;
      }

      try {
        const document = await getDocument(id);

        setTitle(document.title);
        setContent(document.content);
        setStatus(document.status);
      } catch {
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [id]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id) {
      setError('Document id not found');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const document = await updateDocument(id, {
        title,
        content,
        status,
      });

      navigate(`/knowledge-base/${document.id}`);
    } catch {
      setError('Failed to update document');
    } finally {
      setSubmitting(false);
    }
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatus(event.target.value as DocumentStatus);
  }

  if (loading) {
    return <p>Loading document...</p>;
  }

  return (
    <div>
      <p>
        <Link to={id ? `/knowledge-base/${id}` : '/knowledge-base'}>Back</Link>
      </p>

      <h1>Edit Document</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>
          <br />
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="content">Content</label>
          <br />
          <textarea
            id="content"
            name="content"
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <br />
          <select id="status" name="status" value={status} onChange={handleStatusChange}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
