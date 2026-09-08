import React, { useState, useEffect } from 'react';
import { Sun, Moon, UserCircle, Bug } from 'lucide-react';
import './Header.css';

const Header = ({ title, role, setRole, debugMode, setDebugMode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="top-header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        <div className="header-actions">
          {setDebugMode && (
            <button 
              className={`theme-toggle ${debugMode ? 'debug-active' : ''}`}
              onClick={() => setDebugMode(!debugMode)}
              title="Toggle Debug Mode (Disable Form Validation)"
              style={{ color: debugMode ? 'var(--accent-orange)' : 'inherit' }}
            >
              <Bug size={18} />
            </button>
          )}
          <div className="role-switcher">
            <UserCircle size={16} />
            <select 
              value={role} 
              onChange={(e) => setRole && setRole(e.target.value)}
              className="role-select"
            >
              <option value="pejabat">View as: Pejabat</option>
              <option value="petugas">View as: Petugas</option>
            </select>
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setIsDark(!isDark)}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
