import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MembersBarChart } from '../components/Charts/DashboardCharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [planData, setPlanData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, plansRes, summaryRes, yearlyRes] = await Promise.all([
          api.get('/members'),
          api.get('/plans'),
          api.get('/payments/summary'),
          api.get(`/payments/yearly?year=${new Date().getFullYear()}`),
        ]);

        const members = membersRes.data;
        const plans = plansRes.data;

        setSummary(summaryRes.data);
        setYearlyData(yearlyRes.data?.monthlyRevenue || []);

        const planCounts = plans.map((plan) => ({
          name: plan.name,
          count: members.filter((m) => String(m.membershipPlan?._id) === String(plan._id)).length,
        }));
        setPlanData(planCounts);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const cards = summary ? [
    { label: 'Total Revenue', value: `${summary.revenue.total} EGP`, color: '#6366f1' },
    { label: 'Monthly Revenue', value: `${summary.revenue.month} EGP`, color: '#10b981' },
    { label: 'Active Members', value: summary.members.active, color: '#f59e0b' },
    { label: "Today's Attendance", value: summary.attendance.today, color: '#8b5cf6' },
    { label: 'New This Month', value: summary.members.newThisMonth, color: '#6366f1' },
    { label: 'Renewals', value: summary.members.renewalsThisMonth, color: '#10b981' },
    { label: 'Total Members', value: summary.members.total, color: '#f59e0b' },
    { label: 'Overdue', value: summary.overdue, color: '#ef4444' },
  ] : [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <button onClick={() => navigate('/reports')} className="btn btn-primary">Full Reports</button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color, cursor: 'pointer' }}
            onClick={() => card.label === 'Overdue' && navigate('/reports')}>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <MembersBarChart data={planData} />
        {yearlyData.length > 0 && (
          <div className="chart-card">
            <h3>Yearly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData.map(m => ({ ...m, _id: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m._id] }))}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
