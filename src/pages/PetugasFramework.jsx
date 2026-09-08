import React from 'react';
import Layout from '../components/Layout';
import SurveyWizard from '../components/SurveyWizard/SurveyWizard';
import './PetugasFramework.css';

const PetugasFramework = ({ role, setRole, debugMode, setDebugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData }) => {
  return (
    <Layout role={role} setRole={setRole} title="Portal Survei Petugas" debugMode={debugMode} setDebugMode={setDebugMode}>
      <div className="petugas-dashboard-container">
        <SurveyWizard 
          debugMode={debugMode} 
          categoriesData={categoriesData} 
          setCategoriesData={setCategoriesData}
          schoolsData={schoolsData}
          setSchoolsData={setSchoolsData}
        />
      </div>
    </Layout>
  );
};

export default PetugasFramework;
