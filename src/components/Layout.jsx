import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, role, setRole, title = "Dashboard", debugMode, setDebugMode, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
      />
      <main className="main-content">
        <Header
          title={title}
          role={role}
          setRole={setRole}
          debugMode={debugMode}
          setDebugMode={setDebugMode}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <div className="content-inner">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
