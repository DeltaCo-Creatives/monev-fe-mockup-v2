import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, Lock } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/', { replace: true });
  };

  return (
    <div className="login-page">
      <form className="login-card glass" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="logo-icon">
            <GraduationCap size={28} color="#ffffff" />
          </div>
          <h2>Kemen<span>dikdasmen</span></h2>
          <p>Monitoring &amp; Evaluasi Revitalisasi SMP</p>
        </div>

        <label className="login-field">
          <span>Username</span>
          <div className="input-with-icon">
            <User size={16} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </label>

        <label className="login-field">
          <span>Password</span>
          <div className="input-with-icon">
            <Lock size={16} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <button type="submit" className="login-btn">Masuk</button>
      </form>
    </div>
  );
};

export default Login;
