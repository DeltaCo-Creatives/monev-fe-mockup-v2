import React from 'react';
import { LayoutDashboard, CheckSquare, Settings, Users, LogOut, GraduationCap, Map, Database, PlusCircle, FileSpreadsheet } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role, activeTab = 'dashboard', setActiveTab = () => {} }) => {
  const isPejabat = role === 'pejabat';

  const handleTabClick = (e, tabId) => {
    e.preventDefault();
    setActiveTab(tabId);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
             <GraduationCap size={28} color="#ffffff" />
          </div>
          <div className="logo-text">
            <h2>Kemen<span>dikdasmen</span></h2>
            <p>{isPejabat ? 'DIREKTORAT SMP' : 'MONEV LAPANGAN'}</p>
          </div>
        </div>
      </div>

      <div className="sidebar-menu-label">{isPejabat ? 'MANAJEMEN PUSAT' : 'TUGAS PETUGAS'}</div>
      
      <nav className="sidebar-nav">
        {isPejabat ? (
          <>
            <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => handleTabClick(e, 'dashboard')}>
              <LayoutDashboard size={20} />
              <span>Dashboard Kategori</span>
            </a>
            <a href="#"
              className={`nav-item ${activeTab === 'management' ? 'active' : ''}`}
              onClick={(e) => handleTabClick(e, 'management')}
            >
              <Database size={20} className="menu-icon" />
              <span>Manajemen Status</span>
            </a>
            <a href="#"
              className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
              onClick={(e) => handleTabClick(e, 'create')}
            >
              <PlusCircle size={20} className="menu-icon" />
              <span>Buat Program Monev</span>
            </a>
            <a href="#"
              className={`nav-item ${activeTab === 'data' ? 'active' : ''}`}
              onClick={(e) => handleTabClick(e, 'data')}
            >
              <FileSpreadsheet size={20} className="menu-icon" />
              <span>Data & Ekspor</span>
            </a>
          </>
        ) : (
          <>
            <a href="#" className="nav-item active">
              <CheckSquare size={20} />
              <span>Survei Lapangan</span>
            </a>
            <a href="#" className="nav-item">
              <Users size={20} />
              <span>Riwayat Penugasan</span>
            </a>
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
          <button className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
