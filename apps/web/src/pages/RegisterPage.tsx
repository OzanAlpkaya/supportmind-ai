import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { saveAccessToken } from '../auth/tokenStorage';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('new-user@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const response = await register({ email, password });
      saveAccessToken(response.accessToken);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Registration failed. Try another email or password.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brand">SupportMind AI</div>
        <h1>Create your workspace</h1>
        <p>Start with a default workspace and build your AI support knowledge base.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field-label">
            Email
            <input
              value={email}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="field-label">
            Password
            <input
              value={password}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              required
            />
          </label>

          {error && <p className="alert alert-error">{error}</p>}

          <button type="submit" className="button button-primary full-width" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
