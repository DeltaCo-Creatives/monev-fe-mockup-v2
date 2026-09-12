import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './PejabatFramework.css';
import SchoolDetailFullView from '../components/SchoolDetailFullView';
import MonevFormBuilder from '../components/MonevFormBuilder';
import MonevDataViewer from '../components/MonevDataViewer';

// Import extracted components
import PejabatDashboardView from './PejabatDashboardView';
import PejabatManagementView from './PejabatManagementView';

const PejabatFramework = ({ role, setRole, debugMode, setDebugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const getTitle = () => {
    if (location.pathname.includes('management')) return 'Manajemen Status Sekolah';
    if (location.pathname.includes('create')) return 'Buat Program Monev';
    if (location.pathname.includes('data')) return 'Data & Ekspor';
    return 'Command Center (Directorate)';
  };

  const [detailedSchool, setDetailedSchool] = useState(null);

  const handleCreateCategory = (newCategory) => {
    setCategoriesData(prev => [newCategory, ...prev]);
    navigate('/pejabat/dashboard');
  };

  const handleStatusChange = (schoolId, newStatus) => {
    const oldSchool = schoolsData.find(s => s.id === schoolId);
    if (!oldSchool || oldSchool.status === newStatus) return;

    const oldStatus = oldSchool.status;
    const catId = oldSchool.categoryId;

    setSchoolsData(prev => prev.map(s => s.id === schoolId ? { ...s, status: newStatus } : s));

    setCategoriesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        const newStats = { ...cat.stats };
        
        if (oldStatus === 'Selesai') newStats.completedSurveys--;
        if (oldStatus === 'Belum') newStats.pendingSurveys--;
        if (oldStatus === 'Kendala') newStats.issuesReported--;
        
        if (newStatus === 'Selesai') newStats.completedSurveys++;
        if (newStatus === 'Belum') newStats.pendingSurveys++;
        if (newStatus === 'Kendala') newStats.issuesReported++;

        return { ...cat, stats: newStats };
      }
      return cat;
    }));
  };

  return (
    <>
      <Layout role={role} setRole={setRole} title={getTitle()} debugMode={debugMode} setDebugMode={setDebugMode} onLogout={onLogout}>
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {detailedSchool ? (
          <SchoolDetailFullView school={detailedSchool} onBack={() => setDetailedSchool(null)} />
        ) : (
          <Routes>
            <Route path="dashboard" element={
              <PejabatDashboardView 
                categoriesData={categoriesData} 
                schoolsData={schoolsData} 
                setDetailedSchool={setDetailedSchool} 
              />
            } />
            <Route path="management" element={
              <PejabatManagementView 
                categoriesData={categoriesData} 
                schoolsData={schoolsData} 
                handleStatusChange={handleStatusChange} 
              />
            } />
            <Route path="create" element={
              <MonevFormBuilder 
                onSave={handleCreateCategory} 
                onCancel={() => navigate('/pejabat/dashboard')} 
              />
            } />
            <Route path="data" element={
              <MonevDataViewer 
                categoriesData={categoriesData} 
                schoolsData={schoolsData} 
              />
            } />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        )}
        </div>
      </Layout>
    </>
  );
};

export default PejabatFramework;
