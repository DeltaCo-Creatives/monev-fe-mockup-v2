import React, { useState } from 'react';
import PejabatFramework from './pages/PejabatFramework';
import PetugasFramework from './pages/PetugasFramework';
import categoriesDataRaw from './data/categories.json';
import mockSchoolsDataRaw from './data/mock_schools_progress.json';

function App() {
  const [role, setRole] = useState('petugas'); // 'pejabat' or 'petugas'
  const [debugMode, setDebugMode] = useState(false);
  const [categoriesData, setCategoriesData] = useState(categoriesDataRaw);
  const [schoolsData, setSchoolsData] = useState(mockSchoolsDataRaw);

  return (
    <>
      {role === 'pejabat' ? (
        <PejabatFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} />
      ) : (
        <PetugasFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} />
      )}
    </>
  );
}

export default App;
