import React, { useState } from 'react';
import Layout from '../components/Layout';
import SurveyWizard from '../components/SurveyWizard/SurveyWizard';
import RiwayatPenugasan from '../components/RiwayatPenugasan';
import './PetugasFramework.css';

const PetugasFramework = ({ role, setRole, debugMode, setDebugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData, riwayatData, setRiwayatData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('survei');

  return (
    <Layout
      role={role}
      setRole={setRole}
      title={activeTab === 'riwayat' ? 'Riwayat Penugasan' : 'Portal Survei Petugas'}
      debugMode={debugMode}
      setDebugMode={setDebugMode}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
    >
      <div className="petugas-dashboard-container">
        {activeTab === 'riwayat' ? (
          <RiwayatPenugasan riwayatData={riwayatData} />
        ) : (
          <SurveyWizard
            debugMode={debugMode}
            categoriesData={categoriesData}
            setCategoriesData={setCategoriesData}
            schoolsData={schoolsData}
            setSchoolsData={setSchoolsData}
            setRiwayatData={setRiwayatData}
          />
        )}
      </div>
    </Layout>
  );
};

export default PetugasFramework;
