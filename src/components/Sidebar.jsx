import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, Users, LogOut, GraduationCap, Map, Database, PlusCircle, FileSpreadsheet, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Sidebar.css';

const Sidebar = ({ role, isOpen = false, onClose = () => {}, onLogout = () => {} }) => {
  const isPejabat = role === 'pejabat';
  const sidebarRef = React.useRef(null);
  const navigate = useNavigate();

  // Defer heavy React route transitions so the Sidebar CSS sweep animation can start smoothly on the GPU first!
  const handleNavClick = (e, path) => {
    e.preventDefault();
    onClose();
    // Yield to the browser to paint the sidebar closing animation frame
    setTimeout(() => {
      React.startTransition(() => {
        navigate(path);
      });
    }, 150);
  };

  useGSAP(() => {
    gsap.fromTo(".logo-container", 
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "transform,opacity"
      }
    );
    gsap.fromTo(".nav-item", 
      { x: -15, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
        delay: 0.1,
        clearProps: "transform,opacity"
      }
    );
    gsap.fromTo(".sidebar-footer", 
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
        clearProps: "transform,opacity"
      }
    );
  }, { scope: sidebarRef, dependencies: [role] });

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo-container">
          <img src="/logo-kemdikbud.svg" alt="Kemdikbud" className="sidebar-kemdikbud-logo" />
          <div className="logo-text">
            <h2>Kemen<span>dikdasmen</span></h2>
            <p>{isPejabat ? 'DIREKTORAT SMP' : 'MONEV LAPANGAN'}</p>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Tutup menu">
          <X size={22} />
        </button>
      </div>

      <div className="sidebar-menu-label">{isPejabat ? 'MANAJEMEN PUSAT' : 'TUGAS PETUGAS'}</div>
      
      <nav className="sidebar-nav">
        {isPejabat ? (
          <>
            <NavLink to="/pejabat/dashboard" className="nav-item" onClick={(e) => handleNavClick(e, '/pejabat/dashboard')}>
              <LayoutDashboard size={20} />
              <span>Dashboard Kategori</span>
            </NavLink>
            <NavLink to="/pejabat/management" className="nav-item" onClick={(e) => handleNavClick(e, '/pejabat/management')}>
              <Database size={20} className="menu-icon" />
              <span>Manajemen Status</span>
            </NavLink>
            <NavLink to="/pejabat/create" className="nav-item" onClick={(e) => handleNavClick(e, '/pejabat/create')}>
              <PlusCircle size={20} className="menu-icon" />
              <span>Buat Program Monev</span>
            </NavLink>
            <NavLink to="/pejabat/data" className="nav-item" onClick={(e) => handleNavClick(e, '/pejabat/data')}>
              <FileSpreadsheet size={20} className="menu-icon" />
              <span>Data & Ekspor</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/petugas/survei" className="nav-item" onClick={(e) => handleNavClick(e, '/petugas/survei')}>
              <CheckSquare size={20} />
              <span>Survei Lapangan</span>
            </NavLink>
            <NavLink to="/petugas/riwayat" className="nav-item" onClick={(e) => handleNavClick(e, '/petugas/riwayat')}>
              <Users size={20} />
              <span>Riwayat Penugasan</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
        <div className="user-profile">
          <div className="avatar">{isPejabat ? 'DR' : 'PT'}</div>
          <div className="user-info">
            <h4>{isPejabat ? 'Direktorat' : 'Petugas Survei'}</h4>
            <p>{isPejabat ? 'Pusat' : 'Lapangan'}</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
