import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace } from '../api/workspaces';

export function CreateWorkspacePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      await createWorkspace({ name });
      navigate('/dashboard');
    } catch {
      setError('Workspace could not be created.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Create workspace</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="workspace-name">Workspace name</label>
          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="SupportMind Demo"
            required
            minLength={2}
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create workspace'}
        </button>
      </form>
    </main>
  );
}
