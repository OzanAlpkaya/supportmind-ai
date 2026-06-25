import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ConversationDetailPage } from './pages/ConversationDetailPage';
import { CreateDocumentPage } from './pages/CreateDocumentPage';
import { CreateWorkspacePage } from './pages/CreateWorkspacePage';
import DashboardPage from './pages/DashboardPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { EditDocumentPage } from './pages/EditDocumentPage';
import { InboxPage } from './pages/InboxPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import LoginPage from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inbox" element={<InboxPage />} />
        <Route path="/conversations/:id" element={<ConversationDetailPage />} />
        <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/knowledge-base/new" element={<CreateDocumentPage />} />
        <Route path="/knowledge-base/:id" element={<DocumentDetailPage />} />
        <Route path="/knowledge-base/:id/edit" element={<EditDocumentPage />} />
        <Route path="/workspaces/new" element={<CreateWorkspacePage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/ai-assistant" element={<Navigate to="/ai" replace />} />
        <Route path="/settings/profile" element={<ProfilePage />} />
        <Route path="/settings/workspace" element={<WorkspaceSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
