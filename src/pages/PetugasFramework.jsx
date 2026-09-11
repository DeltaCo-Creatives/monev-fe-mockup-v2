import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import Layout from '../components/Layout';
import SurveyWizard from '../components/SurveyWizard/SurveyWizard';
import RiwayatPenugasan from '../components/RiwayatPenugasan';
import './PetugasFramework.css';

const PetugasFramework = ({ role, setRole, debugMode, setDebugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData, riwayatData, setRiwayatData, onLogout }) => {
  const location = useLocation();
  const title = location.pathname.includes('riwayat') ? 'Riwayat Penugasan' : 'Portal Survei Petugas';

  const containerRef = React.useRef(null);
  useGSAP(() => {
    gsap.from(".petugas-dashboard-container > *", {
      y: 30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "back.out(1.5)",
      clearProps: "all"
    });
  }, { scope: containerRef, dependencies: [location.pathname] });

  return (
    <Layout
      role={role}
      setRole={setRole}
      title={title}
      debugMode={debugMode}
      setDebugMode={setDebugMode}
      onLogout={onLogout}
    >
      <div className="petugas-dashboard-container" ref={containerRef}>
        <Routes>
          <Route path="survei" element={
            <SurveyWizard
              debugMode={debugMode}
              categoriesData={categoriesData}
              setCategoriesData={setCategoriesData}
              schoolsData={schoolsData}
              setSchoolsData={setSchoolsData}
              setRiwayatData={setRiwayatData}
            />
          } />
          <Route path="riwayat" element={
            <RiwayatPenugasan riwayatData={riwayatData} />
          } />
          <Route path="*" element={<Navigate to="survei" replace />} />
        </Routes>
      </div>
    </Layout>
  );
};

export default PetugasFramework;
