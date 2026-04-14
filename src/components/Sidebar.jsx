import './Sidebar.css';

export default function Sidebar({ trustName = 'Trust', onDashboard, onLogout }) {
  return (
    <aside className="sb-sidebar">
      <div className="sb-brand">
        <div className="sb-brand-logo">
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
            <path d="M16 2L29 9V23L16 30L3 23V9L16 2Z" fill="url(#sbGrad)" />
            <path d="M16 8L12 18H20L16 24" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="sbGrad" x1="3" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366F1" /><stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="sb-brand-text">
          <span className="sb-brand-name" title={trustName}>{trustName}</span>
          <span className="sb-brand-sub">Admin Panel</span>
        </div>
      </div>

      <div className="sb-section-label">NAVIGATION</div>
      <nav className="sb-nav">
        <button className="sb-item active" onClick={onDashboard}>
          <span className="sb-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
          </span>
          <span className="sb-label">Dashboard</span>
          <span className="sb-indicator" />
        </button>
      </nav>

      <div className="sb-bottom">
        <button className="sb-logout" onClick={onLogout}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
