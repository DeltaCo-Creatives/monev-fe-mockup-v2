import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import Step1SchoolSearch from './Step1SchoolSearch';
import Step2CategorySelect from './Step2CategorySelect';
import Step3Form from './Step3Form';
import Step4Success from './Step4Success';
import './SurveyWizard.css';

const SurveyWizard = ({ debugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData, setRiwayatData }) => {
  const location = useLocation();
  const navigate = useNavigate();

  let step = 1;
  if (location.pathname.includes('/success/')) step = 4;
  else if (location.pathname.includes('/form/')) step = 3;
  else if (location.pathname.includes('/category/')) step = 2;

  const handleNextStep1 = (school) => {
    navigate(`category/${school.NPSN}`);
  };

  const handleNextStep2 = (npsn, categoryId) => {
    navigate(`form/${npsn}/${categoryId}`);
  };

  const handleNextStep3 = (school, category, data) => {
    const schoolIdStr = school.NPSN || school.npsn;
    const catId = category.id;
    const isKendala = data.hasCriticalIssue;
    const answers = data.answers || {};

    setSchoolsData(prev => {
      const existing = prev.find(s => s.npsn === schoolIdStr && s.categoryId === catId);
      if (existing) {
        return prev.map(s => s.id === existing.id ? { ...s, status: isKendala ? 'Kendala' : 'Selesai', tanggalSurvei: new Date().toISOString(), answers } : s);
      } else {
        return [...prev, {
          id: `s-${Date.now()}`,
          categoryId: catId,
          npsn: schoolIdStr,
          nama: school['Nama Satuan Pendidikan'] || school.nama,
          provinsi: school.Provinsi || school.provinsi,
          kabupaten: school['Kab/Kota'] || school.kabupaten,
          status: isKendala ? 'Kendala' : 'Selesai',
          tanggalSurvei: new Date().toISOString(),
          petugas: 'Budi Santoso (ID: PTG-8821)',
          answers
        }];
      }
    });

    setCategoriesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        const newStats = { ...cat.stats };
        const existed = schoolsData.find(s => s.npsn === schoolIdStr && s.categoryId === catId);
        
        if (existed && existed.status === 'Belum') {
          newStats.pendingSurveys--;
          if (isKendala) {
            newStats.issuesReported = (newStats.issuesReported || 0) + 1;
          } else {
            newStats.completedSurveys++;
          }
        } else if (!existed) {
          newStats.totalSchools++;
          if (isKendala) {
            newStats.issuesReported = (newStats.issuesReported || 0) + 1;
          } else {
            newStats.completedSurveys++;
          }
        }
        return { ...cat, stats: newStats };
      }
      return cat;
    }));

    if (setRiwayatData) {
      setRiwayatData(prev => [{
        id: `r-${Date.now()}`,
        sekolah: school['Nama Satuan Pendidikan'] || school.nama,
        kategori: category.name,
        tanggal: new Date().toISOString(),
        status: isKendala ? 'Kendala' : 'Selesai'
      }, ...prev]);
    }

    navigate(`../success/${schoolIdStr}/${catId}`, { replace: true });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleReset = () => {
    navigate('/petugas/survei/search');
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(handleReset, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const steps = [
    { num: 1, title: 'Pilih Lokasi' },
    { num: 2, title: 'Kategori Monev' },
    { num: 3, title: 'Isi Instrumen' },
    { num: 4, title: 'Selesai' }
  ];

  return (
    <div className="wizard-container">
      {/* Stepper Header */}
      <div className="stepper-header glass">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className={`step-item ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className="step-title">{s.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-connector ${step > s.num ? 'active' : ''}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Wizard Content Area */}
      <div className="wizard-content">
        <Routes>
          <Route path="search" element={
            <Step1SchoolSearch 
              onNext={handleNextStep1} 
            />
          } />
          <Route path="category/:npsn" element={
            <Step2CategorySelect 
              onNext={handleNextStep2} 
              onBack={handleBack} 
              categoriesData={categoriesData}
            />
          } />
          <Route path="form/:npsn/:categoryId" element={
            <Step3Form 
              debugMode={debugMode}
              categoriesData={categoriesData}
              onNext={handleNextStep3} 
              onBack={handleBack} 
            />
          } />
          <Route path="success/:npsn/:categoryId" element={
            <Step4Success 
              categoriesData={categoriesData}
              onReset={handleReset} 
            />
          } />
          <Route path="*" element={<Navigate to="search" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default SurveyWizard;
