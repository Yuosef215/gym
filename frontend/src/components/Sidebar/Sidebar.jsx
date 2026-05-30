import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, gym, logout } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  const links = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/members', label: 'Members', icon: '👥' },
    { to: '/plans', label: 'Plans', icon: '📋' },
    { to: '/attendance', label: 'Attendance', icon: '✅' },
    { to: '/payments', label: 'Payments', icon: '💰' },
    ...(isAdmin ? [{ to: '/users', label: 'Users', icon: '🔐' }] : []),
    ...(isSuperAdmin ? [{ to: '/admin/gyms', label: 'Gyms', icon: '🏢' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🏋️ {gym?.name || 'Gym Pro'}</h2>
        {gym && <span className="gym-badge">{gym.name}</span>}
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          {isSuperAdmin && <span className="user-role" style={{ color: '#f59e0b' }}>🔱 Super Admin</span>}
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
