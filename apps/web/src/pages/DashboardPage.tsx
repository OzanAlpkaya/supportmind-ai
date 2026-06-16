import { useNavigate } from 'react-router-dom';

import { removeAccessToken } from '../auth/tokenStorage';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAccessToken();
    navigate('/login');
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
};

export default DashboardPage;
