import { useState, useEffect } from 'react';
import api from '../api/axios';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ member: '', amount: '', paymentMethod: 'cash', plan: '', notes: '' });
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [membersRes, plansRes] = await Promise.all([
          api.get('/members'),
          api.get('/plans'),
        ]);
        setMembers(membersRes.data);
        setPlans(plansRes.data);
      } catch (err) {
        console.error(err);
      }
      fetchPayments();
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', form);
      setShowModal(false);
      setForm({ member: '', amount: '', paymentMethod: 'cash', plan: '', notes: '' });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePlanSelect = (planId) => {
    const plan = plans.find((p) => p._id === planId);
    if (plan) {
      setForm({ ...form, plan: planId, amount: plan.price });
    } else {
      setForm({ ...form, plan: planId });
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payments</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">+ New Payment</button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Plan</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan="7" className="empty">No payments found</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p._id}>
                  <td>{p.member?.name}</td>
                  <td><strong>{p.amount} EGP</strong></td>
                  <td><span className={`badge badge-${p.paymentMethod}`}>{p.paymentMethod}</span></td>
                  <td>{p.plan?.name || '-'}</td>
                  <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td>{p.notes || '-'}</td>
                  <td>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-danger">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Payment</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Member *</label>
                <select value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })} required>
                  <option value="">Select member...</option>
                  {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Plan (auto-fills amount)</label>
                <select value={form.plan} onChange={(e) => handlePlanSelect(e.target.value)}>
                  <option value="">Select plan...</option>
                  {plans.map((p) => <option key={p._id} value={p._id}>{p.name} - {p.price} EGP</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label>Method</label>
                  <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2"></textarea>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Record Payment</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
