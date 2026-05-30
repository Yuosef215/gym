import { useState, useEffect } from 'react';
import api from '../api/axios';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const params = { date: dateFilter };
      const res = await api.get('/attendance', { params });
      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const membersRes = await api.get('/members');
        setMembers(membersRes.data.filter((m) => m.status === 'active'));
      } catch (err) {
        console.error(err);
      }
      fetchRecords();
    };
    init();
  }, []);

  useEffect(() => { fetchRecords(); }, [dateFilter]);

  const handleCheckIn = async () => {
    if (!selectedMember) return alert('Please select a member');
    try {
      await api.post('/attendance/checkin', { memberId: selectedMember });
      setSelectedMember('');
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/attendance/checkout/${id}`);
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Attendance</h1>
      </div>

      <div className="checkin-card">
        <h3>Quick Check-In</h3>
        <div className="checkin-form">
          <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="filter-select">
            <option value="">Select member...</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name} - {m.phone}</option>)}
          </select>
          <button onClick={handleCheckIn} className="btn btn-primary">Check In</button>
        </div>
      </div>

      <div className="filters">
        <label>Date:</label>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select" />
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Phone</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan="6" className="empty">No attendance records</td></tr>
            ) : (
              records.map((r) => {
                const checkIn = new Date(r.checkIn);
                const duration = r.checkOut
                  ? Math.round((new Date(r.checkOut) - checkIn) / 60000) + ' min'
                  : 'In progress';
                return (
                  <tr key={r._id}>
                    <td>{r.member?.name}</td>
                    <td>{r.member?.phone}</td>
                    <td>{checkIn.toLocaleTimeString()}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
                    <td>{duration}</td>
                    <td>
                      {!r.checkOut && (
                        <button onClick={() => handleCheckOut(r._id)} className="btn btn-sm btn-warning">Check Out</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
