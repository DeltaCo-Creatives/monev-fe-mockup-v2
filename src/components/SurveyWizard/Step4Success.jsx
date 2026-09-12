import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Step4Success.css';

const Step4Success = ({ categoriesData, onReset }) => {
  const { npsn, categoryId } = useParams();
  const [school, setSchool] = useState(null);
  const [category, setCategory] = useState(null);
  
  useEffect(() => {
    const cat = categoriesData.find(c => c.id === categoryId);
    setCategory(cat);
    
    fetch('/schools.json').then(r => r.json()).then(data => {
       const found = data.find(s => s.NPSN === npsn);
       if (found) setSchool(found);
    }).catch(err => console.error("Error fetching school", err));
  }, [npsn, categoryId, categoriesData]);

  const containerRef = React.useRef(null);
  useGSAP(() => {
    gsap.fromTo(".success-card", 
      { scale: 0.85, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.45,
        ease: "back.out(1.7)",
        clearProps: "transform,opacity"
      }
    );
    gsap.fromTo(".success-icon-wrapper", 
      { scale: 0, rotation: -90 },
      {
        scale: 1,
        rotation: 0,
        duration: 0.5,
        delay: 0.15,
        ease: "back.out(2.5)",
        clearProps: "transform"
      }
    );
    gsap.fromTo(".success-summary > *", 
      { y: 15, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.07,
        delay: 0.3,
        ease: "power2.out",
        clearProps: "transform,opacity"
      }
    );
  }, { scope: containerRef });

  return (
    <div className="wizard-step-card glass success-card" ref={containerRef}>
      <div className="success-icon-wrapper">
        <CheckCircle size={64} className="success-icon" />
      </div>
      
      <h2>Survei Berhasil Dikirim!</h2>
      <p>Terima kasih, data monev untuk sekolah di bawah ini telah berhasil disimpan ke sistem.</p>
      
      <div className="success-summary">
        <div className="summary-item">
          <span>Sekolah:</span>
          <strong>{school?.['Nama Satuan Pendidikan']}</strong>
        </div>
        <div className="summary-item">
          <span>Kategori Monev:</span>
          <strong>{category?.name}</strong>
        </div>
        <div className="summary-item">
          <span>Waktu Kirim:</span>
          <strong>{new Date().toLocaleString('id-ID')}</strong>
        </div>
      </div>

      <div className="wizard-actions" style={{ justifyContent: 'center', borderTop: 'none' }}>
        <button className="btn-primary" onClick={onReset}>
          Mulai Survei Baru <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step4Success;
