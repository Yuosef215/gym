import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', gender: 'male',
    dateOfBirth: '', membershipStartDate: '', membershipPlan: '', notes: '',
  });
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  useEffect(() => {
    const init = async () => {
      try {
        const plansRes = await api.get('/plans');
        setPlans(plansRes.data);
        if (isEdit) {
          const memberRes = await api.get(`/members/${id}`);
          const m = memberRes.data;
          setForm({
            name: m.name, email: m.email || '', phone: m.phone, address: m.address || '',
            gender: m.gender || 'male', dateOfBirth: m.dateOfBirth || '',
            membershipStartDate: m.membershipStartDate ? m.membershipStartDate.split('T')[0] : '',
            membershipPlan: m.membershipPlan?._id || '', notes: m.notes || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.membershipPlan) delete payload.membershipPlan;
      if (isEdit) {
        await api.put(`/members/${id}`, payload);
      } else {
        await api.post('/members', payload);
      }
      navigate('/members');
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Member' : 'Add Member'}</h1>
      </div>
      <div className="form-container">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Membership Start Date</label>
              <input name="membershipStartDate" type="date" value={form.membershipStartDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Membership Plan</label>
              <select name="membershipPlan" value={form.membershipPlan} onChange={handleChange}>
                <option value="">No Plan</option>
                {plans.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.price} EGP{(p.invitations ?? 0) > 0 ? ` (${p.invitations} invites)` : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea name="address" value={form.address} onChange={handleChange} rows="2"></textarea>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows="2"></textarea>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Member' : 'Add Member')}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
