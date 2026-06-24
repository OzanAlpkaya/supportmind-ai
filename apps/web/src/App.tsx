import { Link, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import { CreateWorkspacePage } from './pages/CreateWorkspacePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { InboxPage } from './pages/InboxPage';
import { ConversationDetailPage } from './pages/ConversationDetailPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { CreateDocumentPage } from './pages/CreateDocumentPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { EditDocumentPage } from './pages/EditDocumentPage';

const App = () => {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/login">Login</Link>
        {' | '}
        <Link to="/register">Register</Link>
        {' | '}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h1>SupportMind AI</h1>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge-base"
          element={
            <ProtectedRoute>
              <KnowledgeBasePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge-base/new"
          element={
            <ProtectedRoute>
              <CreateDocumentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge-base/:id"
          element={
            <ProtectedRoute>
              <DocumentDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/knowledge-base/:id/edit"
          element={
            <ProtectedRoute>
              <EditDocumentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/conversations/:id"
          element={
            <ProtectedRoute>
              <ConversationDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces/new"
          element={
            <ProtectedRoute>
              <CreateWorkspacePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
