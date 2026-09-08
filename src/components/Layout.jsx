import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, role, setRole, title = "Dashboard", debugMode, setDebugMode, activeTab, setActiveTab }) => {
  return (
    <div className="app-container">
      <Sidebar role={role} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header title={title} role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} />
        <div className="content-inner animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
