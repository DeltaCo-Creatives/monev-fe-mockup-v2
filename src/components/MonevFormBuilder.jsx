import React, { useState, useRef } from 'react';
import { PlusCircle, Trash2, Settings, Type, Hash, List, CheckSquare, Upload, CheckCircle2, ChevronDown, ChevronUp, X, Calendar, Clock, MapPin } from 'lucide-react';
import DebouncedInput from './DebouncedInput';
import './MonevFormBuilder.css';

const QUESTION_TYPES = [
  { id: 'text', label: 'Teks Pendek / Esai', icon: Type },
  { id: 'number', label: 'Angka (Numerik)', icon: Hash },
  { id: 'select', label: 'Pilihan Ganda (Dropdown)', icon: List },
  { id: 'multiselect', label: 'Pilihan Jamak (Checkboxes)', icon: CheckSquare },
  { id: 'file', label: 'Unggah File / Foto', icon: Upload },
  { id: 'date', label: 'Tanggal (Date Picker)', icon: Calendar },
  { id: 'time', label: 'Waktu (Time Picker)', icon: Clock },
  { id: 'location', label: 'Titik Lokasi (GPS)', icon: MapPin }
];

const DEFAULT_MENU_OPTIONS = [
  "01 - Rehabilitasi ruang kelas dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "02 - Rehabilitasi ruang perpustakaan dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "03 - Rehabilitasi ruang laboratorium IPA dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "03 - Rehabilitasi ruang laboratorium TIK dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "04 - Rehabilitasi ruang Administrasi dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "05 - Rehabilitasi ruang ibadah dengan tingkat kerusakan minimal sedang",
  "06 - Rehabilitasi ruang UKS dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "07 - Rehabilitasi toilet dengan tingkat kerusakan minimal sedang beserta sanitasinya",
  "08 - Rehabilitasi rumah dinas guru dengan tingkat kerusakan minimal sedang beserta perabotnya",
  "09 - Pembangunan ruang kelas baru (RKB) beserta perabotnya",
  "10 - Pembangunan ruang perpustakaan beserta perabotnya",
  "11 - Pembangunan ruang laboratorium IPA beserta perabotnya",
  "11 - Pembangunan ruang laboratorium TIK beserta perabotnya",
  "12 - Pembangunan toilet beserta sanitasinya",
  "14 - Pembangunan ruang Administrasi beserta perabotnya",
  "15 - Pembangunan ruang UKS beserta perabotnya",
  "16 - Pembangunan rumah dinas guru beserta perabotnya",
  "18 - Penataan lingkungan"
];

const MonevFormBuilder = ({ onSave, onCancel }) => {
  const [formMeta, setFormMeta] = useState({ name: '', description: '' });
  const [menuOptions, setMenuOptions] = useState(DEFAULT_MENU_OPTIONS);
  const [questions, setQuestions] = useState([]);
  const [expandedQId, setExpandedQId] = useState(null);
  const containerRef = useRef(null);

  const addQuestion = (typeId) => {
    const newQ = {
      id: `q_${Date.now()}`,
      type: typeId,
      label: '',
      description: '',
      required: true,
      config: {}
    };

    if (typeId === 'text') {
      newQ.config.placeholder = '';
      newQ.config.minLength = '';
      newQ.config.maxLength = '';
    }
    if (typeId === 'select' || typeId === 'multiselect') {
      newQ.config.options = ['Opsi 1'];
    }
    if (typeId === 'number') {
      newQ.config.min = '';
      newQ.config.max = '';
      newQ.config.allowDecimals = false;
      newQ.config.placeholder = '';
    }
    if (typeId === 'file') {
      newQ.config.minFiles = 1;
      newQ.config.maxFiles = 5;
      newQ.config.allowedTypes = 'all'; // all, images, documents
      newQ.config.maxSizeMB = 10;
    }

    setQuestions([...questions, newQ]);
    setExpandedQId(newQ.id);
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateConfig = (id, key, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, config: { ...q.config, [key]: value } };
      }
      return q;
    }));
  };

  const updateCascading = (id, optValue, cascadingData) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const currentCascading = q.config.cascading || {};
        if (!cascadingData) {
          const { [optValue]: _, ...restCascading } = currentCascading;
          return { ...q, config: { ...q.config, cascading: restCascading } };
        }
        return {
          ...q,
          config: {
            ...q.config,
            cascading: {
              ...currentCascading,
              [optValue]: { ...(currentCascading[optValue] || {}), ...cascadingData }
            }
          }
        };
      }
      return q;
    }));
  };

  const renderCascadingBuilder = (q, optValue) => {
    const cascade = q.config.cascading?.[optValue];
    if (!cascade) {
      return (
        <button className="btn-outline-dashed" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', marginTop: '0.5rem' }} onClick={() => updateCascading(q.id, optValue, { type: 'text', label: '', required: false })}>
          + Tambah Pertanyaan Lanjutan
        </button>
      );
    }
    return (
      <div style={{ marginLeft: '1rem', marginTop: '0.5rem', padding: '1rem', borderLeft: '3px solid var(--accent-blue)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h5 style={{ margin: 0, color: 'var(--text-secondary)' }}>Pertanyaan Lanjutan (Jika Jawaban: "{optValue}")</h5>
          <button className="icon-btn danger" onClick={() => updateCascading(q.id, optValue, null)}><X size={16} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <select 
            className="mfb-input-lg" 
            style={{ width: '150px' }}
            value={cascade.type} 
            onChange={(e) => updateCascading(q.id, optValue, { type: e.target.value })}
          >
            <option value="text">Teks Pendek</option>
            <option value="essay">Teks Panjang</option>
            <option value="number">Angka</option>
            <option value="file">File Upload</option>
          </select>
          <input 
            type="text" 
            className="mfb-input-lg" 
            style={{ flex: 1 }}
            placeholder="Label Pertanyaan Lanjutan..." 
            value={cascade.label} 
            onChange={(e) => updateCascading(q.id, optValue, { label: e.target.value })}
          />
        </div>
        <div className="mfb-toggle-group" style={{ marginTop: '0.5rem' }}>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={cascade.required || false}
              onChange={(e) => updateCascading(q.id, optValue, { required: e.target.checked })}
            />
            <span className="slider round"></span>
          </label>
          <span style={{ fontSize: '0.85rem' }}>Wajib Diisi</span>
        </div>
      </div>
    );
  };

  const handleSave = () => {
    if (!formMeta.name) {
      alert("Nama program tidak boleh kosong!");
      return;
    }
    if (questions.length === 0) {
      alert("Harap tambahkan minimal 1 pertanyaan!");
      return;
    }

    const newCategory = {
      id: `monev-custom-${Date.now()}`,
      name: formMeta.name,
      description: formMeta.description,
      icon: "Target",
      stats: { totalSchools: 0, completedSurveys: 0, pendingSurveys: 0, issuesReported: 0 },
      menuOptions: menuOptions.filter(opt => opt.trim() !== ''),
      questions: questions
    };

    onSave(newCategory);
  };

  return (
    <div className="mfb-container gsap-slide-up" ref={containerRef}>
      <div className="mfb-header glass">
        <div className="mfb-header-content">
          <h2>Buat Program Monev Baru</h2>
          <p>Rancang instrumen pendataan lapangan yang komprehensif. Hasil dari form ini akan langsung tersedia untuk Petugas Lapangan.</p>
        </div>
        <div className="mfb-header-actions">
          <button className="btn-secondary" onClick={onCancel}>Batal</button>
          <button className="btn-primary" onClick={handleSave}>
            <CheckCircle2 size={18} /> Simpan & Publikasikan
          </button>
        </div>
      </div>

      <div className="mfb-layout">
        {/* Form Metadata */}
        <div className="mfb-meta-card glass gsap-slide-up">
          <div className="mfb-input-group">
            <label>Judul Program Monev</label>
            <input 
              type="text" 
              placeholder="Contoh: Monev Dana BOS Kinerja SMP 2025" 
              value={formMeta.name}
              onChange={(e) => setFormMeta({ ...formMeta, name: e.target.value })}
              className="mfb-input-lg"
            />
          </div>
          <div className="mfb-input-group mt-1">
            <label>Deskripsi & Instruksi</label>
            <textarea 
              placeholder="Jelaskan tujuan monev ini dan instruksi umum untuk petugas..." 
              value={formMeta.description}
              onChange={(e) => setFormMeta({ ...formMeta, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* Menu Options Configuration */}
        <div className="mfb-meta-card glass gsap-slide-up mt-1">
          <div className="mfb-input-group">
            <label>Konfigurasi Kategori Menu Dokumentasi (Dropdown)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Daftar menu ini akan muncul sebagai pilihan dropdown saat Petugas menambahkan dokumentasi foto Ruang/Bangunan.
            </p>
            {menuOptions.map((opt, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input 
                  type="text" 
                  className="mfb-input-lg" 
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                  value={opt}
                  placeholder="Nama opsi menu..."
                  onChange={(e) => {
                    const newOpts = [...menuOptions];
                    newOpts[idx] = e.target.value;
                    setMenuOptions(newOpts);
                  }}
                />
                <button 
                  className="icon-btn danger" 
                  onClick={() => setMenuOptions(menuOptions.filter((_, i) => i !== idx))}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button 
              className="btn-secondary" 
              style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}
              onClick={() => setMenuOptions([...menuOptions, ""])}
            >
              <PlusCircle size={16} /> Tambah Opsi Menu
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="mfb-questions-list">
          {questions.map((q, index) => {
            const isExpanded = expandedQId === q.id;
            const TypeIcon = QUESTION_TYPES.find(t => t.id === q.type)?.icon || Type;

            return (
              <div key={q.id} className={`mfb-q-card glass gsap-slide-up ${isExpanded ? 'expanded' : ''}`}>
                
                {/* Compact View / Header */}
                <div className="mfb-q-header" onClick={() => setExpandedQId(isExpanded ? null : q.id)}>
                  <div className="mfb-q-drag-handle">{index + 1}</div>
                  <div className="mfb-q-summary">
                    <span className="q-type-badge">
                      <TypeIcon size={14} /> {QUESTION_TYPES.find(t => t.id === q.type)?.label}
                    </span>
                    <h4>{q.label || <em>Pertanyaan belum diisi</em>}</h4>
                  </div>
                  <div className="mfb-q-actions">
                    <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); deleteQuestion(q.id); }}>
                      <Trash2 size={18} />
                    </button>
                    <button className="icon-btn">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                {isExpanded && (
                  <div className="mfb-q-body">
                    <div className="mfb-input-group">
                      <label>Pertanyaan / Label Field</label>
                      <DebouncedInput 
                        type="text" 
                        placeholder="Masukkan pertanyaan di sini..." 
                        value={q.label}
                        onChange={(val) => updateQuestion(q.id, { label: val })}
                      />
                    </div>

                    <div className="mfb-input-group mt-1">
                      <label>Deskripsi / Petunjuk Pengisian (Opsional)</label>
                      <DebouncedInput 
                        type="text" 
                        placeholder="Contoh: Masukkan nilai dalam satuan juta Rupiah..." 
                        value={q.description || ''}
                        onChange={(val) => updateQuestion(q.id, { description: val })}
                      />
                    </div>

                    <div className="mfb-config-grid">
                      {/* Required Toggle */}
                      <div className="mfb-toggle-group">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={q.required}
                            onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                          />
                          <span className="slider round"></span>
                        </label>
                        <span>Wajib Diisi</span>
                      </div>

                      {/* Config: Text */}
                      {q.type === 'text' && (
                        <>
                          <div className="mfb-input-group-inline">
                            <label>Placeholder Text</label>
                            <DebouncedInput 
                              type="text" 
                              placeholder="Teks bayangan..." 
                              value={q.config.placeholder || ''}
                              onChange={(val) => updateConfig(q.id, 'placeholder', val)}
                            />
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Min Karakter</label>
                            <DebouncedInput 
                              type="number" 
                              placeholder="Tidak ada" 
                              value={q.config.minLength || ''}
                              onChange={(val) => updateConfig(q.id, 'minLength', val)}
                            />
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Max Karakter</label>
                            <DebouncedInput 
                              type="number" 
                              placeholder="Tidak ada" 
                              value={q.config.maxLength || ''}
                              onChange={(val) => updateConfig(q.id, 'maxLength', val)}
                            />
                          </div>
                        </>
                      )}

                      {/* Config: Number */}
                      {q.type === 'number' && (
                        <>
                          <div className="mfb-input-group-inline" style={{ flexBasis: '100%' }}>
                            <div className="mfb-toggle-group">
                              <label className="toggle-switch">
                                <input 
                                  type="checkbox" 
                                  checked={q.config.allowDecimals || false}
                                  onChange={(e) => updateConfig(q.id, 'allowDecimals', e.target.checked)}
                                />
                                <span className="slider round"></span>
                              </label>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Izinkan Angka Desimal (Koma)</span>
                            </div>
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Nilai Minimum</label>
                            <DebouncedInput 
                              type="number" 
                              placeholder="Tidak ada batas" 
                              value={q.config.min || ''}
                              onChange={(val) => updateConfig(q.id, 'min', val)}
                            />
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Nilai Maksimum</label>
                            <DebouncedInput 
                              type="number" 
                              placeholder="Tidak ada batas" 
                              value={q.config.max || ''}
                              onChange={(val) => updateConfig(q.id, 'max', val)}
                            />
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Placeholder</label>
                            <input 
                              type="text" 
                              placeholder="Contoh: 1000000" 
                              value={q.config.placeholder || ''}
                              onChange={(e) => updateConfig(q.id, 'placeholder', e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {/* Config: File */}
                      {q.type === 'file' && (
                        <>
                          <div className="mfb-input-group-inline">
                            <label>Format Diterima</label>
                            <select value={q.config.allowedTypes} onChange={(e) => updateConfig(q.id, 'allowedTypes', e.target.value)}>
                              <option value="all">Semua File</option>
                              <option value="images">Hanya Foto (JPG, PNG)</option>
                              <option value="documents">Hanya Dokumen (PDF, Excel)</option>
                            </select>
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Max Ukuran (MB)</label>
                            <input 
                              type="number" 
                              min="1"
                              value={q.config.maxSizeMB || 10}
                              onChange={(e) => updateConfig(q.id, 'maxSizeMB', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="mfb-input-group-inline">
                            <label>Max Jumlah File</label>
                            <input 
                              type="number" 
                              min="1"
                              value={q.config.maxFiles}
                              onChange={(e) => updateConfig(q.id, 'maxFiles', parseInt(e.target.value))}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Config: Boolean Cascading */}
                    {q.type === 'boolean' && (
                      <div className="mfb-options-builder">
                        <label>Konfigurasi Pertanyaan Lanjutan</label>
                        <div style={{ marginBottom: '1rem' }}>
                          <strong>Opsi: Ya</strong>
                          {renderCascadingBuilder(q, 'yes')}
                        </div>
                        <div>
                          <strong>Opsi: Tidak</strong>
                          {renderCascadingBuilder(q, 'no')}
                        </div>
                      </div>
                    )}

                    {/* Config: Options (Select/Multiselect) */}
                    {(q.type === 'select' || q.type === 'multiselect') && (
                      <div className="mfb-options-builder">
                        <label>Pilihan Jawaban</label>
                        {q.config.options.map((opt, optIdx) => (
                          <div key={optIdx} style={{ marginBottom: '1rem' }}>
                            <div className="mfb-option-row">
                              <input 
                                type="text" 
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.config.options];
                                  newOpts[optIdx] = e.target.value;
                                  
                                  // Update cascading key if option name changes
                                  const oldCascading = q.config.cascading?.[opt] || null;
                                  let newCascading = { ...q.config.cascading };
                                  if (oldCascading) {
                                    delete newCascading[opt];
                                    newCascading[e.target.value] = oldCascading;
                                  }
                                  
                                  setQuestions(questions.map(pq => {
                                    if (pq.id === q.id) {
                                      return { ...pq, config: { ...pq.config, options: newOpts, cascading: newCascading } };
                                    }
                                    return pq;
                                  }));
                                }}
                              />
                              <button 
                                className="icon-btn danger"
                                onClick={() => {
                                  const newOpts = q.config.options.filter((_, i) => i !== optIdx);
                                  
                                  let newCascading = { ...q.config.cascading };
                                  delete newCascading[opt];
                                  
                                  setQuestions(questions.map(pq => {
                                    if (pq.id === q.id) {
                                      return { ...pq, config: { ...pq.config, options: newOpts, cascading: newCascading } };
                                    }
                                    return pq;
                                  }));
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                            {renderCascadingBuilder(q, opt)}
                          </div>
                        ))}
                        <button 
                          className="btn-outline-dashed"
                          onClick={() => {
                            updateConfig(q.id, 'options', [...q.config.options, `Opsi ${q.config.options.length + 1}`]);
                          }}
                        >
                          + Tambah Pilihan
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Question Palette */}
        <div className="mfb-add-palette glass gsap-slide-up">
          <h3>Tambah Pertanyaan Baru</h3>
          <div className="palette-grid">
            {QUESTION_TYPES.map(qt => (
              <button key={qt.id} className="palette-btn" onClick={() => addQuestion(qt.id)}>
                <qt.icon size={20} />
                <span>{qt.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MonevFormBuilder;
