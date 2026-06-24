import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { createDocument, type DocumentStatus } from '../api/documents';

export function CreateDocumentPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('DRAFT');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const document = await createDocument({
        title,
        content,
        status,
      });

      navigate(`/knowledge-base/${document.id}`);
    } catch {
      setError('Failed to create document');
    } finally {
      setSubmitting(false);
    }
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatus(event.target.value as DocumentStatus);
  }

  return (
    <div>
      <h1>Create Document</h1>

      <p>Add a new knowledge base document for the current workspace.</p>

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
          {submitting ? 'Creating...' : 'Create document'}
        </button>
      </form>
    </div>
  );
}
