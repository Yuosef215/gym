import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import MemberForm from './pages/MemberForm';
import Plans from './pages/Plans';
import Attendance from './pages/Attendance';
import Expiring from './pages/Expiring';
import ScanQR from './pages/ScanQR';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import AdminGyms from './pages/AdminGyms';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="members" element={<Members />} />
        <Route path="members/new" element={<MemberForm />} />
        <Route path="members/edit/:id" element={<MemberForm />} />
        <Route path="plans" element={<Plans />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="scan-qr" element={<ScanQR />} />
        <Route path="expiring" element={<Expiring />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<Users />} />
        <Route path="admin/gyms" element={<AdminGyms />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
