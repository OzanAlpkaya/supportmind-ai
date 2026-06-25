import { Link, Navigate } from 'react-router-dom';
import { getAccessToken } from '../auth/tokenStorage';

function HomePage() {
  const accessToken = getAccessToken();

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="marketing-shell">
      <section className="marketing-card">
        <div className="eyebrow">AI customer support platform</div>
        <h1>Resolve customer questions with your own knowledge base.</h1>
        <p>
          SupportMind AI combines a support inbox, workspace-scoped knowledge base, pgvector
          retrieval, and source-backed AI answers in one portfolio-ready SaaS product.
        </p>

        <div className="hero-actions">
          <Link to="/register" className="button button-primary">
            Create account
          </Link>
          <Link to="/login" className="button button-ghost">
            Login
          </Link>
        </div>

        <div className="hero-grid">
          <div>
            <strong>RAG-ready</strong>
            <span>Embeddings, retrieval, sources</span>
          </div>
          <div>
            <strong>Multi-tenant</strong>
            <span>Workspace isolation</span>
          </div>
          <div>
            <strong>Support inbox</strong>
            <span>Customers and conversations</span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
