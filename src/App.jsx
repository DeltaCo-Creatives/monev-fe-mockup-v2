import React, { useState } from 'react';
import Login from './pages/Login';
import PejabatFramework from './pages/PejabatFramework';
import PetugasFramework from './pages/PetugasFramework';
import categoriesDataRaw from './data/categories.json';
import mockSchoolsDataRaw from './data/mock_schools_progress.json';
import riwayatDataRaw from './data/riwayat_penugasan.json';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('petugas'); // 'pejabat' or 'petugas'
  const [debugMode, setDebugMode] = useState(false);
  const [categoriesData, setCategoriesData] = useState(categoriesDataRaw);
  const [schoolsData, setSchoolsData] = useState(mockSchoolsDataRaw);
  const [riwayatData, setRiwayatData] = useState(riwayatDataRaw);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      {role === 'pejabat' ? (
        <PejabatFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <PetugasFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} riwayatData={riwayatData} setRiwayatData={setRiwayatData} onLogout={() => setIsLoggedIn(false)} />
      )}
    </>
  );
}

export default App;
