import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import Step1SchoolSearch from './Step1SchoolSearch';
import Step2CategorySelect from './Step2CategorySelect';
import Step3Form from './Step3Form';
import Step4Success from './Step4Success';
import './SurveyWizard.css';

const SurveyWizard = ({ debugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData }) => {
  const [step, setStep] = useState(1);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleNext = (data = {}) => {
    if (step === 3) {
      const schoolIdStr = selectedSchool.NPSN;
      const catId = selectedCategory.id;
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
            npsn: selectedSchool.NPSN,
            nama: selectedSchool['Nama Satuan Pendidikan'],
            provinsi: selectedSchool.Provinsi,
            kabupaten: selectedSchool['Kab/Kota'],
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
    }
    setStep(prev => prev + 1);
  };
  const handleBack = () => setStep(prev => prev - 1);
  
  const handleReset = () => {
    setSelectedSchool(null);
    setSelectedCategory(null);
    setStep(1);
  };

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
        {step === 1 && (
          <Step1SchoolSearch 
            selectedSchool={selectedSchool} 
            setSelectedSchool={setSelectedSchool} 
            onNext={handleNext} 
          />
        )}
        {step === 2 && (
          <Step2CategorySelect 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
            onNext={handleNext} 
            onBack={handleBack} 
            categoriesData={categoriesData}
          />
        )}
        {step === 3 && (
          <Step3Form 
            school={selectedSchool}
            category={selectedCategory}
            debugMode={debugMode}
            categoriesData={categoriesData}
            onNext={handleNext} 
            onBack={handleBack} 
          />
        )}
        {step === 4 && (
          <Step4Success 
            school={selectedSchool}
            category={selectedCategory}
            onReset={handleReset} 
          />
        )}
      </div>
    </div>
  );
};

export default SurveyWizard;
