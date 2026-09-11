import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
      <Route path="/pejabat/*" element={
        isLoggedIn && role === 'pejabat' ? (
          <PejabatFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="/petugas/*" element={
        isLoggedIn && role === 'petugas' ? (
          <PetugasFramework role={role} setRole={setRole} debugMode={debugMode} setDebugMode={setDebugMode} categoriesData={categoriesData} setCategoriesData={setCategoriesData} schoolsData={schoolsData} setSchoolsData={setSchoolsData} riwayatData={riwayatData} setRiwayatData={setRiwayatData} onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <Navigate to="/login" replace />
        )
      } />
      <Route path="*" element={
        !isLoggedIn ? <Navigate to="/login" replace /> : (role === 'pejabat' ? <Navigate to="/pejabat/dashboard" replace /> : <Navigate to="/petugas/survei" replace />)
      } />
    </Routes>
  );
}

export default App;
