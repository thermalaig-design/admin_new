import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import './SimplePage.css';

export default function MarqueePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName = 'Admin', trust = null } = location.state || {};

  useEffect(() => {
    if (!trust?.id) navigate('/dashboard', { replace: true, state: { userName, trust } });
  }, [trust, userName, navigate]);

  return (
    <div className="simple-root">
      <Sidebar
        trustName={trust?.name || 'Trust'}
        onDashboard={() => navigate('/dashboard', { state: { userName, trust } })}
        onLogout={() => navigate('/login')}
      />
      <main className="simple-main">
        <PageHeader
          title="Marquee"
          subtitle="Manage scrolling announcements"
          onBack={() => navigate('/dashboard', { state: { userName, trust } })}
        />
        <div className="simple-content">
          <div className="simple-card">Marquee module coming soon.</div>
        </div>
      </main>
    </div>
  );
}
