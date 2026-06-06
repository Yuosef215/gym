import { useState, useEffect } from 'react';
import api from '../api/axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testResult, setTestResult] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleSendTest = async (e) => {
    e.preventDefault();
    setTestResult('');
    try {
      const res = await api.post('/notifications/test', { phone: testPhone, message: testMessage });
      setTestResult(`Sent! SID: ${res.data.sid}`);
      setTestPhone('');
      setTestMessage('');
      fetchNotifications();
    } catch (err) {
      setTestResult(`Failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBulkReminders = async () => {
    if (!window.confirm('Send reminders to all members expiring within 7 days?')) return;
    try {
      const res = await api.post('/notifications/bulk-reminders?days=7');
      alert(`Sent: ${res.data.sent}, Failed: ${(res.data.results || []).filter(r => r.status === 'failed').length}`);
      fetchNotifications();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Notifications</h1>
        <button className="btn btn-primary" onClick={handleBulkReminders}>Send Bulk Reminders</button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3>Test WhatsApp Message</h3>
        <form onSubmit={handleSendTest} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
          <input type="text" placeholder="Phone (e.g. 01012345678)" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="form-input" required />
          <textarea placeholder="Message text" value={testMessage} onChange={(e) => setTestMessage(e.target.value)} className="form-input" rows={3} required />
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Send Test</button>
        </form>
        {testResult && <p style={{ marginTop: 8, color: testResult.startsWith('Sent') ? '#10b981' : '#ef4444' }}>{testResult}</p>}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Recipient</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr><td colSpan="6" className="empty">No notifications sent yet</td></tr>
            ) : (
              notifications.map((n) => (
                <tr key={n._id}>
                  <td><span className="badge badge-info">{n.type}</span></td>
                  <td>{n.recipient || '-'}</td>
                  <td>{n.phone}</td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                  <td><span className={`badge badge-${n.status === 'sent' ? 'active' : n.status === 'failed' ? 'inactive' : 'warning'}`}>{n.status}</span></td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Notifications;