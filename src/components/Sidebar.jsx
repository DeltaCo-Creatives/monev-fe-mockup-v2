import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, Users, LogOut, GraduationCap, Map, Database, PlusCircle, FileSpreadsheet, X } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Sidebar.css';

const Sidebar = ({ role, isOpen = false, onClose = () => {}, onLogout = () => {} }) => {
  const isPejabat = role === 'pejabat';
  const sidebarRef = React.useRef(null);

  useGSAP(() => {
    gsap.from(".logo-container", {
      y: -20,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.5)",
      clearProps: "all"
    });
    gsap.from(".nav-item", {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.05,
      ease: "power2.out",
      delay: 0.1,
      clearProps: "all"
    });
    gsap.from(".sidebar-footer", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.3,
      clearProps: "all"
    });
  }, { scope: sidebarRef, dependencies: [role] });

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo-container">
          <div className="logo-icon">
             <GraduationCap size={28} color="#ffffff" />
          </div>
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
            <NavLink to="/pejabat/dashboard" className="nav-item" onClick={onClose}>
              <LayoutDashboard size={20} />
              <span>Dashboard Kategori</span>
            </NavLink>
            <NavLink to="/pejabat/management" className="nav-item" onClick={onClose}>
              <Database size={20} className="menu-icon" />
              <span>Manajemen Status</span>
            </NavLink>
            <NavLink to="/pejabat/create" className="nav-item" onClick={onClose}>
              <PlusCircle size={20} className="menu-icon" />
              <span>Buat Program Monev</span>
            </NavLink>
            <NavLink to="/pejabat/data" className="nav-item" onClick={onClose}>
              <FileSpreadsheet size={20} className="menu-icon" />
              <span>Data & Ekspor</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/petugas/survei" className="nav-item" onClick={onClose}>
              <CheckSquare size={20} />
              <span>Survei Lapangan</span>
            </NavLink>
            <NavLink to="/petugas/riwayat" className="nav-item" onClick={onClose}>
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
