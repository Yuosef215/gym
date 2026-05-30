import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminGyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGyms = async () => {
    try {
      const res = await api.get('/admin/gyms');
      setGyms(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGyms(); }, []);

  const toggleActive = async (gym) => {
    try {
      await api.put(`/admin/gyms/${gym._id}`, { active: !gym.active });
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (gym) => {
    if (!window.confirm(`Delete "${gym.name}" and ALL its data? This cannot be undone!`)) return;
    try {
      await api.delete(`/admin/gyms/${gym._id}`);
      fetchGyms();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>🏢 All Gyms</h1>
        <span className="badge badge-super_admin">Super Admin</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Gym</th>
              <th>Contact</th>
              <th>Stats</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gyms.length === 0 ? (
              <tr><td colSpan="6" className="empty">No gyms registered yet</td></tr>
            ) : (
              gyms.map((gym) => (
                <tr key={gym._id}>
                  <td>
                    <strong>{gym.name}</strong>
                    {gym.subscription && <span className="badge badge-cash" style={{ marginLeft: 8 }}>{gym.subscription}</span>}
                  </td>
                  <td>
                    {gym.phone && <div>{gym.phone}</div>}
                    {gym.email && <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{gym.email}</div>}
                  </td>
                  <td>
                    <div className="gym-stats">
                      <span title="Members">👥 {gym.stats?.members || 0}</span>
                      <span title="Plans">📋 {gym.stats?.plans || 0}</span>
                      <span title="Payments">💰 {gym.stats?.payments || 0}</span>
                      <span title="Users">🔐 {gym.stats?.users || 0}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${gym.active ? 'active' : 'inactive'}`}>
                      {gym.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(gym.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => toggleActive(gym)}
                        className={`btn btn-sm ${gym.active ? 'btn-warning' : 'btn-primary'}`}
                      >
                        {gym.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(gym)} className="btn btn-sm btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminGyms;
