import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../auth/tokenStorage';

type PublicOnlyRouteProps = {
  children: React.ReactNode;
};

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const accessToken = getAccessToken();

  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
