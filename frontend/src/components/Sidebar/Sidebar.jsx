import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, gym, logout } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin' || isSuperAdmin;

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/members', label: 'Members' },
    { to: '/plans', label: 'Plans' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/expiring', label: 'Expiring' },
    ...(isAdmin ? [{ to: '/reports', label: 'Reports' }] : []),
    ...(isAdmin ? [{ to: '/users', label: 'Users' }] : []),
    ...(isSuperAdmin ? [{ to: '/admin/gyms', label: 'Gyms' }] : []),
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>{gym?.name || 'Gym Pro'}</h2>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{user?.role?.replace('_', ' ')}</span>
          {isSuperAdmin && <span className="user-role" style={{ color: '#f59e0b' }}>Super Admin</span>}
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
