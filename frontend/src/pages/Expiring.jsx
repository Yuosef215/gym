import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DAY_OPTIONS = [3, 7, 14, 30];

const Expiring = () => {
  const [members, setMembers] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchExpiring = async (d) => {
    setLoading(true);
    try {
      const res = await api.get(`/members/expiring?days=${d}`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpiring(days); }, [days]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Expiring Memberships</h1>
        <div className="filters">
          <label style={{ color: 'var(--text-muted)', fontSize: 14 }}>Show:</label>
          {DAY_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)} className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-secondary'}`}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="alert" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
          No memberships expiring in the next {days} days.
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Expires In</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m._id}>
                  <td>
                    <Link to={`/members/edit/${m._id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{m.name}</Link>
                  </td>
                  <td>{m.phone}</td>
                  <td>{m.membershipPlan?.name || '-'}</td>
                  <td>
                    <span className={`badge ${m.daysRemaining <= 3 ? 'badge-inactive' : 'badge-active'}`}>
                      {m.daysRemaining} day{m.daysRemaining > 1 ? 's' : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Expiring;