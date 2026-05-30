import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data);
          setGym(res.data.gym || null);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('gym');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('gym', JSON.stringify(res.data.gym));
    setUser(res.data.user);
    setGym(res.data.gym);
    return res.data;
  };

  const register = async (name, email, password, gymName) => {
    const res = await api.post('/auth/register', { name, email, password, gymName });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    localStorage.setItem('gym', JSON.stringify(res.data.gym));
    setUser(res.data.user);
    setGym(res.data.gym);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('gym');
    setUser(null);
    setGym(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, gym, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
