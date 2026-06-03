import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { MembersBarChart } from '../components/Charts/DashboardCharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, todayAttendance: 0 });
  const [planData, setPlanData] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, attendanceRes, plansRes, expiringRes, birthdaysRes] = await Promise.all([
          api.get('/members'),
          api.get('/attendance/today'),
          api.get('/plans'),
          api.get('/members/expiring?days=7'),
          api.get('/members/birthdays'),
        ]);

        const members = membersRes.data;
        const attendance = attendanceRes.data;
        const plans = plansRes.data;

        setStats({
          totalMembers: members.length,
          activeMembers: members.filter((m) => m.status === 'active').length,
          todayAttendance: attendance.length,
        });

        setExpiring(expiringRes.data);
        setBirthdays(birthdaysRes.data);

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
    { label: 'Total Members', value: stats.totalMembers, color: '#4f46e5' },
    { label: 'Active Members', value: stats.activeMembers, color: '#10b981' },
    { label: "Today's Attendance", value: stats.todayAttendance, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      {birthdays.length > 0 && (
        <div className="alert-card alert-birthday">
          <div className="alert-card-header">Birthday</div>
          {birthdays.map((m) => (
            <div key={m._id} className="alert-card-item">
              <span className="alert-card-name">{m.name}</span>
              <span className="alert-card-info">{m.phone}</span>
            </div>
          ))}
        </div>
      )}

      {expiring.length > 0 && (
        <div className="alert-card alert-expiring">
          <div className="alert-card-header">Expiring Memberships (next 7 days)</div>
          {expiring.map((m) => (
            <div key={m._id} className="alert-card-item">
              <span className="alert-card-name">{m.name}</span>
              <span className="alert-card-info">{m.membershipPlan?.name} - {m.daysRemaining} day{m.daysRemaining > 1 ? 's' : ''} left</span>
            </div>
          ))}
        </div>
      )}

      <div className="stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card" style={{ borderLeftColor: card.color }}>
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
