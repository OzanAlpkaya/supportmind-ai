import { Navigate, Link } from 'react-router-dom';
import { getAccessToken } from '../auth/tokenStorage';

function HomePage() {
  const accessToken = getAccessToken();

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main>
      <h1>SupportMind AI</h1>
      <p>AI-powered customer support workspace.</p>

      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </main>
  );
}

export default HomePage;
