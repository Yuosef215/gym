import { useState, useEffect } from 'react';
import api from '../api/axios';
import { MembersBarChart } from '../components/Charts/DashboardCharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, todayAttendance: 0 });
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, attendanceRes, plansRes] = await Promise.all([
          api.get('/members'),
          api.get('/attendance/today'),
          api.get('/plans'),
        ]);

        const members = membersRes.data;
        const attendance = attendanceRes.data;
        const plans = plansRes.data;

        setStats({
          totalMembers: members.length,
          activeMembers: members.filter((m) => m.status === 'active').length,
          todayAttendance: attendance.length,
        });

        const planCounts = plans.map((plan) => ({
          name: plan.name,
          count: members.filter((m) => String(m.membershipPlan?._id) === String(plan._id)).length,
        }));
        setPlanData(planCounts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const cards = [
    { label: 'Total Members', value: stats.totalMembers, color: '#4f46e5', icon: '👥' },
    { label: 'Active Members', value: stats.activeMembers, color: '#10b981', icon: '✅' },
    { label: "Today's Attendance", value: stats.todayAttendance, color: '#f59e0b', icon: '📋' },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <MembersBarChart data={planData} />
      </div>
    </div>
  );
};

export default Dashboard;
