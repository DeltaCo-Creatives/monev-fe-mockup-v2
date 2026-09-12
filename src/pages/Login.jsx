import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Login.css';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/', { replace: true });
  };

  const containerRef = React.useRef(null);
  useGSAP(() => {
    gsap.fromTo(".login-card", 
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.2)",
        clearProps: "transform,opacity"
      }
    );
    gsap.fromTo(".login-logo > *, .login-subtitle, .login-subtext", 
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: "back.out(1.5)",
        clearProps: "transform,opacity"
      }
    );
    gsap.fromTo(".login-form-group, .login-btn, .login-footer-links, .login-copyright", 
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.6,
        ease: "power2.out",
        clearProps: "transform,opacity"
      }
    );
  }, { scope: containerRef });

  return (
    <div className="login-page-bg" ref={containerRef}>
      <div className="bg-circle circle-1"></div>
      <div className="bg-circle circle-2"></div>
      
      <div className="login-card">
        <div className="login-logo">
          <img src="/favicon.svg" alt="Kemdikbud Logo" className="kemdikbud-logo" />
          <h2>Kemen<span>dikdasmen</span></h2>
          <div className="login-subtitle">MONITORING &amp; EVALUASI</div>
          <div className="login-subtext">
            Monitoring &amp; Evaluasi Revitalisasi<br />
            Satuan Pendidikan 2026
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Masukkan username / email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="btn-icon-only eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                <Eye size={18} />
              </button>
            </div>
            <div className="forgot-password-link">
              <a href="#lupa">Lupa Password?</a>
            </div>
          </div>

          <button type="submit" className="login-btn btn-primary">
            Masuk <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer-links">
          <p>Belum punya akun untuk aplikasi Monev Sarpras?</p>
          <button type="button" className="login-btn btn-secondary">
            Daftar Sekarang
          </button>
        </div>

        <div className="login-copyright">
          © 2026 Revitalisasi Satuan Pendidikan — Kemendikdasmen
        </div>
      </div>
    </div>
  );
};

export default Login;
