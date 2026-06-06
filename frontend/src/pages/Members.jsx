import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import QRModal from '../components/Modals/QRModal';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [qrMember, setQrMember] = useState(null);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/members', { params });
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    try {
      await api.delete(`/members/${id}`);
      setMembers(members.filter((m) => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUseInvitation = async (id) => {
    try {
      const res = await api.post(`/members/${id}/use-invitation`);
      alert(res.data.message);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to use invitation');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Members</h1>
        <Link to="/members/new" className="btn btn-primary">+ Add Member</Link>
      </div>

      <div className="filters">
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Search by name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Invitations</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan="8" className="empty">No members found</td></tr>
            ) : (
              members.map((member) => (
                <tr key={member._id}>
                  <td>{member.name}</td>
                  <td>{member.phone}</td>
                  <td>{member.email || '-'}</td>
                  <td>{member.membershipPlan?.name || '-'}</td>
                  <td>
                    {(() => {
                      const total = member.membershipPlan?.invitations ?? 0;
                      const used = member.usedInvitations ?? 0;
                      const remaining = total - used;
                      return total > 0 ? (
                        <span className={`badge badge-${remaining > 0 ? 'active' : 'inactive'}`}>
                          {used}/{total}
                        </span>
                      ) : '-';
                    })()}
                  </td>
                  <td><span className={`badge badge-${member.status}`}>{member.status}</span></td>
                  <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                  <td className="actions">
                    <button onClick={() => navigate(`/members/edit/${member._id}`)} className="btn btn-sm btn-secondary">Edit</button>
                    <button onClick={() => handleDelete(member._id)} className="btn btn-sm btn-danger">Delete</button>
                    <button onClick={() => setQrMember(member)} className="btn btn-sm btn-secondary">QR</button>
                    {(() => {
                      const total = member.membershipPlan?.invitations ?? 0;
                      const used = member.usedInvitations ?? 0;
                      return total > 0 && used < total ? (
                        <button onClick={() => handleUseInvitation(member._id)} className="btn btn-sm btn-primary">+Invite</button>
                      ) : null;
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {qrMember && <QRModal member={qrMember} onClose={() => setQrMember(null)} />}
    </div>
  );
};

export default Members;
