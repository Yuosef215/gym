import { useState, useEffect } from 'react';
import api from '../api/axios';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', durationDays: '', price: '', invitations: '' });
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openAdd = () => {
    setEditPlan(null);
    setForm({ name: '', description: '', durationDays: '', price: '', invitations: '' });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({ name: plan.name, description: plan.description || '', durationDays: plan.durationDays, price: plan.price, invitations: plan.invitations ?? '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editPlan) {
        await api.put(`/plans/${editPlan._id}`, form);
      } else {
        await api.post('/plans', form);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await api.delete(`/plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Membership Plans</h1>
        <button onClick={openAdd} className="btn btn-primary">+ Add Plan</button>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan._id} className="plan-card">
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-actions">
                <button onClick={() => openEdit(plan)} className="btn btn-sm btn-secondary">Edit</button>
                <button onClick={() => handleDelete(plan._id)} className="btn btn-sm btn-danger">Delete</button>
              </div>
            </div>
            <p className="plan-desc">{plan.description || 'No description'}</p>
            <div className="plan-details">
              <div className="plan-detail">
                <span>Duration</span>
                <strong>{plan.durationDays} days</strong>
              </div>
              <div className="plan-detail">
                <span>Price</span>
                <strong className="plan-price">{plan.price} EGP</strong>
              </div>
              <div className="plan-detail">
                <span>Invitations</span>
                <strong>{(plan.invitations ?? 0)} invites</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editPlan ? 'Edit Plan' : 'Add Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Plan Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="2"></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration (days) *</label>
                  <input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} min="1" required />
                </div>
                <div className="form-group">
                  <label>Price (EGP) *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} min="0" step="0.01" required />
                </div>
              </div>
              <div className="form-group">
                <label>Invitations included</label>
                <input type="number" value={form.invitations} onChange={(e) => setForm({ ...form, invitations: e.target.value })} min="0" placeholder="0 = no invitations" />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editPlan ? 'Update' : 'Create'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
