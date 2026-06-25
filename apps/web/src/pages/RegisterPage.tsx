import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { register } from '../api/auth';
import { saveAccessToken } from '../auth/tokenStorage';

type FormSubmitEvent = {
  preventDefault: () => void;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('new-user@example.com');
  const [password, setPassword] = useState('password123');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormSubmitEvent) => {
    event.preventDefault();

    setError(null);
    setAccessToken(null);
    setIsLoading(true);

    try {
      const response = await register({
        email,
        password,
      });

      setAccessToken(response.accessToken);
      saveAccessToken(response.accessToken);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      {accessToken && (
        <section>
          <h2>Register successful</h2>
          <p>Access token received and saved.</p>
        </section>
      )}

      {error && <p>{error}</p>}
    </main>
  );
};

export default RegisterPage;
