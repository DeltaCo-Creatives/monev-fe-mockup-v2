import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layers, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import './Step2CategorySelect.css';

const Step2CategorySelect = ({ onNext, onBack, categoriesData }) => {
  const { npsn } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  return (
    <div className="wizard-step-card gsap-slide-up glass">
      <div className="step-header">
        <h2>Pilih Kategori Monev</h2>
        <p>Silakan pilih jenis monitoring dan evaluasi yang akan Anda laporkan untuk sekolah ini.</p>
      </div>

      <div className="category-cards-grid">
        {categoriesData.map((cat) => (
          <div 
            key={cat.id} 
            className={`cat-select-card ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <div className="cat-card-icon">
              <Layers size={24} />
            </div>
            <div className="cat-card-content">
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
            </div>
            {selectedCategory?.id === cat.id && (
              <div className="cat-card-check">
                <CheckCircle2 size={24} color="var(--accent-orange)" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="wizard-actions">
        <button className="btn-secondary" onClick={onBack}>
          <ChevronLeft size={18} /> Kembali
        </button>
        <button 
          className="btn-primary" 
          disabled={!selectedCategory} 
          onClick={() => onNext(npsn, selectedCategory.id)}
        >
          Lanjut Isi Instrumen <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step2CategorySelect;
