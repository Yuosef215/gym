import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', gymName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.gymName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Gym Pro</h1>
          <p>Create New Gym</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <h2>Register</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Your Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@mygym.com" required />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label>Gym Name *</label>
            <input name="gymName" value={form.gymName} onChange={handleChange} placeholder="My Awesome Gym" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Create Gym & Register'}
          </button>
          <p className="login-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
