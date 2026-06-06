import { useState, useEffect } from 'react';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const [tab, setTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthYear, setMonthYear] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, dailyRes, overdueRes] = await Promise.all([
        api.get('/payments/summary'),
        api.get(`/payments/daily?date=${date}`),
        api.get('/payments/overdue'),
      ]);
      setSummary(summaryRes.data);
      setDaily(dailyRes.data);
      setOverdue(overdueRes.data);

      const [y, m] = monthYear.split('-');
      const monthlyRes = await api.get(`/payments/monthly?year=${y}&month=${parseInt(m)}`);
      setMonthly(monthlyRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [date, monthYear]);

  const fetchYearly = async (year) => {
    const res = await api.get(`/payments/yearly?year=${year}`);
    setYearly(res.data);
  };

  useEffect(() => {
    if (tab === 'overview' || tab === 'yearly') {
      fetchYearly(new Date().getFullYear());
    }
  }, [tab]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'daily', label: 'Daily' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
    { key: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Financial Reports</h1>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 4 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '10px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
              background: tab === t.key ? 'var(--primary)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-muted)', fontWeight: 500, fontSize: 14,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && summary && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {[
              { label: 'Today Revenue', value: `${summary.revenue.today} EGP`, color: '#10b981' },
              { label: 'Monthly Revenue', value: `${summary.revenue.month} EGP`, color: '#6366f1' },
              { label: 'Total Revenue', value: `${summary.revenue.total} EGP`, color: '#8b5cf6' },
              { label: 'Active Members', value: summary.members.active, color: '#f59e0b' },
              { label: 'New This Month', value: summary.members.newThisMonth, color: '#6366f1' },
              { label: 'Renewals', value: summary.members.renewalsThisMonth, color: '#10b981' },
              { label: 'Overdue', value: summary.overdue, color: '#ef4444' },
              { label: "Today's Attendance", value: summary.attendance.today, color: '#f59e0b' },
            ].map((c) => (
              <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
                <div className="stat-info">
                  <span className="stat-label">{c.label}</span>
                  <span className="stat-value">{c.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            {monthly && monthly.dailyRevenue && (
              <div className="chart-card">
                <h3>Daily Revenue (This Month)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthly.dailyRevenue}>
                    <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {monthly && monthly.revenueByPlan && (
              <div className="chart-card">
                <h3>Revenue by Plan</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={monthly.revenueByPlan} dataKey="total" nameKey="planName" cx="50%" cy="50%" outerRadius={100} label>
                      {monthly.revenueByPlan.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {yearly && yearly.monthlyRevenue && (
            <div className="chart-card" style={{ marginTop: 24 }}>
              <h3>Monthly Revenue (Year)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={yearly.monthlyRevenue.map(m => ({ ...m, _id: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id] }))}>
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {tab === 'daily' && daily && (
        <div>
          <div className="filters">
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="filter-select" />
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total Revenue', value: `${daily.totalRevenue} EGP`, color: '#6366f1' },
              { label: 'New Members', value: daily.newMembers, color: '#10b981' },
              { label: 'Renewals', value: daily.renewals, color: '#f59e0b' },
              { label: 'Attendance', value: daily.attendance, color: '#8b5cf6' },
              { label: 'Overdue', value: daily.overdue, color: '#ef4444' },
            ].map((c) => (
              <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
                <div className="stat-info">
                  <span className="stat-label">{c.label}</span>
                  <span className="stat-value">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          {daily.revenueByMethod?.length > 0 && (
            <div className="chart-card">
              <h3>Revenue by Method</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={daily.revenueByMethod} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                    {daily.revenueByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab === 'monthly' && monthly && (
        <div>
          <div className="filters">
            <label>Month:</label>
            <input type="month" value={monthYear} onChange={(e) => setMonthYear(e.target.value)} className="filter-select" />
          </div>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total Revenue', value: `${monthly.total} EGP`, color: '#6366f1' },
              { label: 'New Members', value: monthly.newMembers, color: '#10b981' },
              { label: 'Renewals', value: monthly.renewals, color: '#f59e0b' },
            ].map((c) => (
              <div key={c.label} className="stat-card" style={{ borderLeftColor: c.color }}>
                <div className="stat-info">
                  <span className="stat-label">{c.label}</span>
                  <span className="stat-value">{c.value}</span>
                </div>
              </div>
            ))}
          </div>
          {monthly.dailyRevenue?.length > 0 && (
            <div className="chart-card">
              <h3>Daily Revenue</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthly.dailyRevenue}>
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="charts-grid" style={{ marginTop: 24 }}>
            {monthly.revenueByPlan?.length > 0 && (
              <div className="chart-card">
                <h3>Revenue by Plan</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={monthly.revenueByPlan} dataKey="total" nameKey="planName" cx="50%" cy="50%" outerRadius={100} label>
                      {monthly.revenueByPlan.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {monthly.revenueByMethod?.length > 0 && (
              <div className="chart-card">
                <h3>Revenue by Method</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={monthly.revenueByMethod} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label>
                      {monthly.revenueByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'yearly' && yearly && (
        <div>
          <div className="chart-card">
            <h3>Monthly Revenue ({yearly.year})</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={yearly.monthlyRevenue.map(m => ({ ...m, _id: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id] }))}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'overdue' && (
        <div>
          {overdue.length === 0 ? (
            <div className="alert" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}>
              No overdue payments
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Phone</th>
                    <th>Plan</th>
                    <th>Expired (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((m) => (
                    <tr key={m._id}>
                      <td>{m.name}</td>
                      <td>{m.phone}</td>
                      <td>{m.plan}</td>
                      <td><span className="badge badge-inactive">{m.expiredDays} days</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;