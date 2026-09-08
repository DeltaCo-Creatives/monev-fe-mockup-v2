import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import './Step4Success.css';

const Step4Success = ({ school, category, onReset }) => {
  return (
    <div className="wizard-step-card animate-fade-in glass success-card">
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
