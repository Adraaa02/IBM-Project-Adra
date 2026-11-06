import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/matches', label: 'Buddy Match', icon: '🤝' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/evaluation', label: 'Evaluation', icon: '⭐' },
];

const adminOnly = ['/members', '/matches'];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filtered = navItems.filter(
    (item) => user?.role === 'admin' || !adminOnly.includes(item.to)
  );

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-icon">🎓</span>
            <div>
              <div className="brand-name">Buddy System</div>
              <div className="brand-sub">Onboarding</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="nav-icon">👤</span>
            <span>Profile</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        <header className="topbar">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="topbar-title">Onboarding Buddy System</div>
          <div className="topbar-user">
            <div className="avatar-circle small">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="topbar-user-info">
              <span className="topbar-name">{user?.name}</span>
              <span className={`role-badge role-${user?.role}`}>{formatRole(user?.role)}</span>
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function formatRole(role) {
  if (!role) return '';
  return role === 'new_member' ? 'New Member' : role.charAt(0).toUpperCase() + role.slice(1);
}
