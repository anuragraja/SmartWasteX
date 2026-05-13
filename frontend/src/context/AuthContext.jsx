import api from "@/config/api";
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get(`/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data.data);
        } catch (err) {
          console.error(err);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post(`/api/auth/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await api.post(`/api/auth/register`, formData);
    if (res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const loginFace = async (email, faceDescriptor) => {
    const res = await api.post(`/api/auth/login-face`, { email, faceDescriptor });
    setToken(res.data.token);
    setUser(res.data.user);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  };

  const registerFace = async (faceDescriptor) => {
    const res = await api.post(`/api/auth/register-face`, 
      { faceDescriptor },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginFace, registerFace, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
