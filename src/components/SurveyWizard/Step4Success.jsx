import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import './Step4Success.css';

const Step4Success = ({ school, category, onReset }) => {
  const containerRef = React.useRef(null);
  useGSAP(() => {
    gsap.from(".success-card", {
      scale: 0.8,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.5)"
    });
    gsap.from(".success-icon-wrapper", {
      scale: 0,
      rotation: -180,
      duration: 0.8,
      delay: 0.2,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.from(".success-summary > *", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.4,
      ease: "power2.out"
    });
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
