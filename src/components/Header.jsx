import React, { useState, useEffect } from 'react';
import { Sun, Moon, UserCircle, Bug, Menu } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Header.css';

const Header = ({ title, role, setRole, debugMode, setDebugMode, onMenuClick }) => {
  const [isDark, setIsDark] = useState(false);
  const overlayRef = React.useRef(null);
  const isAnimating = React.useRef(false);

  const handleThemeToggle = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const nextIsDark = !isDark;
    const overlayColor = nextIsDark ? '#0f172a' : '#f4f7f6';
    const overlay = overlayRef.current;

    // Pre-promote to its own GPU compositor layer BEFORE animation starts
    gsap.set(overlay, {
      x: '100%',
      backgroundColor: overlayColor,
      display: 'block',
      willChange: 'transform',
    });

    // Phase 1: Sweep in from right
    gsap.to(overlay, {
      x: '0%',
      duration: 0.45,
      ease: 'power3.inOut',
      onComplete: () => {
        // Phase 2: Stop in the middle and change the theme
        if (nextIsDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Phase 3: Wait for the browser to FINISH painting the new theme.
        // requestAnimationFrame fires before the next repaint. 
        // Nesting two of them guarantees the theme change has been fully painted to the screen.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // ONLY exit sweep after we are 100% sure the theme is painted
            gsap.to(overlay, {
              x: '-100%',
              duration: 0.4,
              ease: 'power3.in',
              onComplete: () => {
                // Cleanup
                setIsDark(nextIsDark);
                gsap.set(overlay, { display: 'none', willChange: 'auto' });
                isAnimating.current = false;
              }
            });
          });
        });
      }
    });
  };


  return (
    <>
      {/* Full-screen wipe overlay for dark mode transition */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'none',
          pointerEvents: 'none',
        }}
      />
      <header className="top-header">
      <div className="header-content">
        <div className="header-left">
          {onMenuClick && (
            <button className="menu-toggle" onClick={onMenuClick} aria-label="Buka menu">
              <Menu size={22} />
            </button>
          )}
          <h1 className="header-title">{title}</h1>
        </div>
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
            onClick={(e) => {
              gsap.fromTo(e.currentTarget,
                { rotation: 0, scale: 0.5 },
                { rotation: 180, scale: 1, duration: 0.5, ease: "back.out(1.5)", clearProps: "transform" }
              );
              handleThemeToggle();
            }}
            title="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
