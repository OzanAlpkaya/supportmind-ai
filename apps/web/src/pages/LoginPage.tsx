import { useState } from 'react';

import { login } from '../api/auth';
import { saveAccessToken } from '../auth/tokenStorage';

type FormSubmitEvent = {
  preventDefault: () => void;
};

const LoginPage = () => {
  const [email, setEmail] = useState('ozan@example.com');
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
      const response = await login({
        email,
        password,
      });

      setAccessToken(response.accessToken);
      saveAccessToken(response.accessToken);
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {accessToken && (
        <section>
          <h2>Login successful</h2>
          <p>Access token received.</p>
        </section>
      )}

      {error && <p>{error}</p>}
    </main>
  );
};

export default LoginPage;
