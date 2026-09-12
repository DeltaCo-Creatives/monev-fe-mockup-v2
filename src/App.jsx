import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Code Splitting: These massive files (and their dependencies like Recharts) 
// are ONLY downloaded when the user actually navigates to them!
const Login = lazy(() => import('./pages/Login'));
const PejabatFramework = lazy(() => import('./pages/PejabatFramework'));
const PetugasFramework = lazy(() => import('./pages/PetugasFramework'));
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

  // A smooth full-screen loading fallback while Vite downloads the JS chunks
  const PageLoader = () => (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
      <Loader2 size={40} color="var(--accent-blue)" style={{ animation: 'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default App;
