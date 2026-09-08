import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Building, UploadCloud, AlertTriangle, User, Info, FileSpreadsheet, MapPin } from 'lucide-react';
import './Step3Form.css';

const Step3Form = ({ school, category, debugMode, onNext, onBack }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasCriticalIssue, setHasCriticalIssue] = useState(false);
  
  // State for Excel file
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Real-time answers state for conditional logic
  const [formValues, setFormValues] = useState({});

  // Custom Validation Errors
  const [errors, setErrors] = useState({});

  const validateInput = (id, type, config, value) => {
    setFormValues(prev => ({...prev, [id]: value}));
    
    let err = null;
    if (value === '' || value === null) {
       setErrors(prev => ({...prev, [id]: null}));
       return;
    }
    if (type === 'number') {
      const num = parseFloat(value);
      if (config.min !== '' && num < parseFloat(config.min)) {
        err = `Angka tidak boleh kurang dari ${config.min}`;
      } else if (config.max !== '' && num > parseFloat(config.max)) {
        err = `Angka tidak boleh lebih dari ${config.max}`;
      }
    } else if (type === 'text' || type === 'essay') {
      if (config.minLength && value.length < parseInt(config.minLength)) {
        err = `Teks minimal ${config.minLength} karakter (sekarang ${value.length})`;
      } else if (config.maxLength && value.length > parseInt(config.maxLength)) {
        err = `Teks maksimal ${config.maxLength} karakter (sekarang ${value.length})`;
      }
    }
    setErrors(prev => ({...prev, [id]: err}));
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file.name);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file.name);
    }
  };

  const handleCheckboxClick = (e) => {
    e.preventDefault();
    if (!isUnlocked) {
      setShowConfirmModal(true);
    }
  };

  const confirmUnlock = () => {
    setIsUnlocked(true);
    setShowConfirmModal(false);
  };

  const renderCascadingField = (parentQ, optValue) => {
    const cascade = parentQ.config?.cascading?.[optValue];
    if (!cascade) return null;
    
    const actualValue = formValues[parentQ.id];
    let isSelected = false;
    if (Array.isArray(actualValue)) {
      isSelected = actualValue.includes(optValue);
    } else {
      isSelected = actualValue === optValue;
    }
    
    if (!isSelected) return null;
    
    const cascadingQ = {
      ...cascade,
      id: `${parentQ.id}_cascade_${optValue}`
    };
    
    return (
      <div className="cascading-question animate-slide-up" style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
        <label className="form-label" style={{ fontSize: '0.95rem' }}>{cascadingQ.label} {cascadingQ.required && <span className="req">*</span>}</label>
        {renderQuestion(cascadingQ)}
      </div>
    );
  };

  const renderQuestion = (q) => {
    const isRequired = debugMode || hasCriticalIssue ? false : q.required;
    const isDisabled = !isUnlocked || hasCriticalIssue;
    const config = q.config || {};
    
    switch (q.type) {
      case 'select':
        return (
          <div>
            <select 
              name={q.id} 
              className="form-select premium-input" 
              required={isRequired} 
              disabled={isDisabled}
              onChange={(e) => setFormValues(prev => ({...prev, [q.id]: e.target.value}))}
            >
              <option value="">Pilih opsi...</option>
              {config.options && config.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
            {config.options && config.options.map(opt => renderCascadingField(q, opt))}
          </div>
        );
      case 'multiselect':
        return (
          <div className="radio-group premium-radio-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            {config.options && config.options.map((opt, i) => (
              <div key={i} style={{ width: '100%' }}>
                <label className="premium-radio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    name={q.id} 
                    value={opt} 
                    disabled={isDisabled} 
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormValues(prev => {
                        const arr = prev[q.id] || [];
                        if (isChecked) return { ...prev, [q.id]: [...arr, opt] };
                        return { ...prev, [q.id]: arr.filter(v => v !== opt) };
                      });
                    }}
                  /> 
                  {opt}
                </label>
                {renderCascadingField(q, opt)}
              </div>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <div>
            <div className="radio-group premium-radio-group">
              <label className="premium-radio">
                <input type="radio" name={q.id} value="yes" required={isRequired} disabled={isDisabled} onChange={(e) => setFormValues(prev => ({...prev, [q.id]: e.target.value}))} /> Ya
              </label>
              <label className="premium-radio">
                <input type="radio" name={q.id} value="no" required={isRequired} disabled={isDisabled} onChange={(e) => setFormValues(prev => ({...prev, [q.id]: e.target.value}))} /> Tidak
              </label>
            </div>
            {renderCascadingField(q, 'yes')}
            {renderCascadingField(q, 'no')}
          </div>
        );
      case 'essay':
        return (
          <div>
            <textarea 
              name={q.id} 
              className={`form-textarea premium-input ${errors[q.id] ? 'danger-input' : ''}`} 
              rows="3" 
              placeholder={config.placeholder || "Masukkan jawaban detail..."}
              required={isRequired} 
              disabled={isDisabled}
              minLength={config.minLength}
              maxLength={config.maxLength}
              onChange={(e) => validateInput(q.id, q.type, config, e.target.value)}
              onBlur={(e) => validateInput(q.id, q.type, config, e.target.value)}
            ></textarea>
            {errors[q.id] && <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors[q.id]}</div>}
          </div>
        );
      case 'number':
        return (
          <div>
            <input 
              name={q.id}
              type="number" 
              className={`form-input premium-input ${errors[q.id] ? 'danger-input' : ''}`} 
              placeholder={config.placeholder || "Masukkan angka..."}
              required={isRequired} 
              disabled={isDisabled} 
              min={config.min} 
              max={config.max}
              step={config.allowDecimals ? "any" : "1"}
              onChange={(e) => validateInput(q.id, q.type, config, e.target.value)}
              onBlur={(e) => validateInput(q.id, q.type, config, e.target.value)}
            />
            {errors[q.id] && <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors[q.id]}</div>}
            {(config.min !== '' || config.max !== '') && !errors[q.id] && (
               <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                 Batas: {config.min !== '' ? `Min ${config.min}` : ''} {config.max !== '' ? `Max ${config.max}` : ''}
               </small>
            )}
          </div>
        );
      case 'file':
        const fileDesc = config.allowedTypes === 'images' ? 'Hanya menerima Foto/Gambar.' : 
                         config.allowedTypes === 'documents' ? 'Hanya menerima Dokumen (PDF, Word, Excel).' : 'Menerima semua format file.';
        return (
          <div className="file-upload-wrapper">
            <input 
              name={q.id}
              type="file" 
              className="form-input premium-input" 
              required={isRequired} 
              disabled={isDisabled} 
              accept={config.allowedTypes === 'images' ? 'image/*' : config.allowedTypes === 'documents' ? '.pdf,.doc,.docx,.xls,.xlsx' : '*'} 
              multiple={config.maxFiles > 1} 
            />
            <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
              Maksimal {config.maxFiles || 1} file. Ukuran max {config.maxSizeMB || 10}MB/file. {fileDesc}
            </small>
          </div>
        );
      case 'date':
        return <input name={q.id} type="date" className="form-input premium-input" required={isRequired} disabled={isDisabled} />;
      case 'time':
        return <input name={q.id} type="time" className="form-input premium-input" required={isRequired} disabled={isDisabled} />;
      case 'location':
        return (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input name={q.id} type="text" className="form-input premium-input" placeholder="Koordinat GPS..." required={isRequired} disabled={isDisabled} readOnly style={{ flex: 1, backgroundColor: 'var(--bg-card)' }} />
            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={(e) => { e.currentTarget.previousSibling.value = '-6.200000, 106.816666'; }}>
              <MapPin size={18} /> Deteksi GPS
            </button>
          </div>
        );
      case 'text':
      default:
        return (
          <div>
            <input 
              name={q.id} 
              type="text" 
              className={`form-input premium-input ${errors[q.id] ? 'danger-input' : ''}`} 
              placeholder={config.placeholder || "Masukkan teks..."}
              required={isRequired} 
              disabled={isDisabled} 
              minLength={config.minLength}
              maxLength={config.maxLength}
              onChange={(e) => validateInput(q.id, q.type, config, e.target.value)}
              onBlur={(e) => validateInput(q.id, q.type, config, e.target.value)}
            />
            {errors[q.id] && <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors[q.id]}</div>}
          </div>
        );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isUnlocked && !hasCriticalIssue) return;

    // Extract form data
    const formData = new FormData(e.target);
    const answers = {};
    for (let [key, value] of formData.entries()) {
      if (!value) continue;
      if (answers[key]) {
        if (!Array.isArray(answers[key])) {
          answers[key] = [answers[key]];
        }
        answers[key].push(value);
      } else {
        answers[key] = value;
      }
    }
    // Files are captured as File objects by FormData, which is perfect for a mockup.
    // However, to display in our table, we might just want to store their names.
    for (let key in answers) {
      if (answers[key] instanceof File) {
        answers[key] = answers[key].name;
      } else if (Array.isArray(answers[key]) && answers[key][0] instanceof File) {
        answers[key] = answers[key].map(f => f.name).join(', ');
      } else if (Array.isArray(answers[key])) {
        answers[key] = answers[key].join(', '); // Join multiselect values
      }
    }

    setTimeout(() => {
      onNext({ hasCriticalIssue, answers });
    }, 500);
  };

  return (
    <>
      <div className="wizard-step-card step3-container animate-fade-in glass">
        <div className="step-header">
          <h2>Isi Instrumen & Dokumentasi</h2>
          <p>Lengkapi form instrumen dan unggah foto dokumentasi untuk sekolah yang dipilih.</p>
        </div>

        <div className="target-school-banner slide-up-1">
          <Building size={20} className="banner-icon" />
          <div className="banner-info">
            <span>Target Survei Saat Ini:</span>
            <strong>{school['Nama Satuan Pendidikan']} (NPSN: {school['NPSN']})</strong>
          </div>
        </div>

      <form className="dynamic-survey-form" onSubmit={handleSubmit}>
        
        {/* 1. Catatan & Kendala Section (MOVED TO TOP) */}
        <div className="form-section premium-section slide-up-2">
          <div className="section-header">
            <AlertTriangle size={18} />
            <h3>Laporkan Kendala Lapangan</h3>
          </div>
          <p className="section-desc">Laporkan jika ada masalah kritis yang membuat sekolah ini tidak bisa disurvei. Mengaktifkan ini akan mengabaikan form instrumen di bawahnya.</p>
          
          <div className="critical-issue-container glass">
            <div className="critical-issue-header">
              <div className="issue-text">
                <strong>Kendala Kritis</strong>
                <span>Sekolah tidak dapat ditindaklanjuti (contoh: sekolah tutup, alamat palsu, bencana)</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={hasCriticalIssue}
                  onChange={(e) => setHasCriticalIssue(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {hasCriticalIssue && (
              <div className="critical-issue-details animate-fade-in">
                <label className="form-label">Detail Kendala Kritis <span className="req">*</span></label>
                <textarea 
                  name="kendalaDetail"
                  className="form-textarea premium-input danger-input" 
                  rows="3" 
                  placeholder="Jelaskan alasan spesifik mengapa sekolah ini bermasalah..." 
                  required={!debugMode && hasCriticalIssue}
                ></textarea>
              </div>
            )}
          </div>
        </div>

        {/* 2. Status Kunjungan (The Lock) */}
        <div className={`premium-section warning-card slide-up-3 ${hasCriticalIssue ? 'bypassed-state' : ''}`}>
          <div className="section-header warning-header">
            <AlertTriangle size={20} />
            <h3>Status Kunjungan (Wajib)</h3>
          </div>
          <p className="warning-desc">
            Anda harus menyatakan bahwa Anda telah mulai melakukan Monev di sekolah ini untuk membuka form. 
            <strong> Perhatian: Aksi ini tidak dapat dibatalkan</strong> dan hanya dapat diubah oleh Direktorat Pusat.
          </p>
          <label className={`checkbox-lock-label ${isUnlocked ? 'locked-state' : ''}`}>
            <input 
              type="checkbox" 
              className="checkbox-lock"
              checked={isUnlocked}
              onChange={() => {}}
              onClick={handleCheckboxClick}
              disabled={isUnlocked || hasCriticalIssue}
            />
            Saya menyatakan mulai melakukan Monev di sekolah ini.
          </label>
        </div>
        
        {/* Form Content wrapped in opacity based on lock */}
        <div className={`form-content-wrapper ${(!isUnlocked && !hasCriticalIssue) ? 'is-locked' : ''} ${hasCriticalIssue ? 'bypassed-state' : ''}`}>
          
          {/* 2. Data Umum Section */}
          <div className="form-section premium-section slide-up-3">
            <div className="section-header">
              <User size={18} />
              <h3>A. Data Umum</h3>
            </div>
            
            <div className="data-umum-grid">
              <div className="form-group">
                <label className="form-label">Nama Petugas Survei</label>
                <input type="text" className="form-input premium-input filled" value="Budi Santoso (ID: PTG-8821)" readOnly disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Pelaksanaan</label>
                <input type="text" className="form-input premium-input filled" value={new Date().toLocaleDateString('id-ID')} readOnly disabled />
              </div>
              <div className="form-group span-full">
                <label className="form-label">Alamat Sekolah</label>
                <textarea className="form-textarea premium-input filled" rows="2" value={`${school['Kab/Kota']}, ${school['Provinsi']}`} readOnly disabled></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Kepala Sekolah {!hasCriticalIssue && <span className="req">*</span>}</label>
                <input name="kepsek" type="text" className="form-input premium-input" placeholder="Masukkan nama kepsek..." required={!debugMode && !hasCriticalIssue} disabled={!isUnlocked || hasCriticalIssue} />
              </div>
              <div className="form-group">
                <label className="form-label">No. HP Kepala Sekolah {!hasCriticalIssue && <span className="req">*</span>}</label>
                <input name="hp" type="tel" className="form-input premium-input" placeholder="08..." required={!debugMode && !hasCriticalIssue} disabled={!isUnlocked || hasCriticalIssue} />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Pengawas Bina (Jika Ada)</label>
                <input name="pengawas" type="text" className="form-input premium-input" placeholder="Masukkan nama pengawas..." disabled={!isUnlocked || hasCriticalIssue} />
              </div>
            </div>
          </div>

          {/* 3. Dynamic Questions Section */}
          <div className="form-section premium-section slide-up-4">
            <div className="section-header">
              <FileText size={18} />
              <h3>B. Instrumen {category.name}</h3>
            </div>
            
            <div className="questions-list">
              {category.questions.map((q, idx) => (
                <div key={q.id} className="form-group question-block">
                  <label className="form-label question-label">
                    <div>
                      <span className="q-num">{idx + 1}.</span> {q.label} {q.required && <span className="req">*</span>}
                    </div>
                    {q.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 400 }}>
                        {q.description}
                      </div>
                    )}
                  </label>
                  <div className="form-input-wrapper">
                    {renderQuestion(q)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Dokumen Pendukung Section */}
          <div className="form-section premium-section slide-up-5">
            <div className="section-header">
              <FileSpreadsheet size={18} />
              <h3>C. Dokumen Pendukung</h3>
            </div>
            <p className="section-desc">Unggah file instrumen rekapitulasi Monev (.xlsx) dan Surat Pernyataan Kepala Sekolah (.pdf).</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Excel Upload */}
              <div className="doc-upload-group">
                <label className="form-label">Rekapitulasi Monev (Excel) <span className="req">*</span></label>
                <label className={`upload-zone massive-doc-zone ${!isUnlocked ? 'disabled' : ''} ${excelFile ? 'has-file' : ''}`}>
                  <UploadCloud size={48} color={isUnlocked ? "var(--accent-orange)" : "var(--text-secondary)"} />
                  {excelFile ? (
                    <div className="file-success">
                      <strong>{excelFile}</strong>
                      <span>(Klik untuk mengganti)</span>
                    </div>
                  ) : (
                    <div className="file-prompt">
                      <strong>Pilih File Excel</strong>
                      <span>.xlsx, .xls</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="file-input-hidden" 
                    required={!debugMode && !hasCriticalIssue} 
                    disabled={!isUnlocked || hasCriticalIssue}
                    onChange={handleExcelUpload}
                  />
                </label>
              </div>

              {/* PDF Upload */}
              <div className="doc-upload-group">
                <label className="form-label">Surat Pernyataan Kepsek (PDF) <span className="req">*</span></label>
                <label className={`upload-zone massive-doc-zone ${!isUnlocked ? 'disabled' : ''} ${pdfFile ? 'has-file' : ''}`}>
                  <UploadCloud size={48} color={isUnlocked ? "var(--accent-red)" : "var(--text-secondary)"} />
                  {pdfFile ? (
                    <div className="file-success" style={{ color: 'var(--accent-red)' }}>
                      <strong>{pdfFile}</strong>
                      <span>(Klik untuk mengganti)</span>
                    </div>
                  ) : (
                    <div className="file-prompt">
                      <strong>Pilih File PDF</strong>
                      <span>.pdf (Maks 5MB)</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="file-input-hidden" 
                    required={!debugMode && !hasCriticalIssue} 
                    disabled={!isUnlocked || hasCriticalIssue}
                    onChange={handlePdfUpload}
                  />
                </label>
              </div>
            </div>
          </div>
          {/* 5. Catatan Tambahan */}
          <div className="form-section premium-section slide-up-6">
            <div className="section-header">
              <FileText size={18} />
              <h3>Catatan Tambahan</h3>
            </div>
            <div className="form-group">
              <label className="form-label">Catatan Umum / Tambahan (Opsional)</label>
              <textarea 
                name="catatanTambahan"
                className="form-textarea premium-input" 
                rows="3" 
                placeholder="Tambahkan informasi lain yang mungkin berguna..." 
                disabled={!isUnlocked || hasCriticalIssue}
              ></textarea>
            </div>
          </div>
          
        </div>

        {/* Actions */}
        <div className="wizard-actions">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ChevronLeft size={18} /> Kembali
          </button>
          <button type="submit" className={`btn-primary ${(!isUnlocked && !hasCriticalIssue) ? 'disabled-btn' : ''}`} disabled={!isUnlocked && !hasCriticalIssue}>
            Simpan & Lanjutkan <ChevronRight size={18} />
          </button>
        </div>
      </form>
    </div>

    {showConfirmModal && (
      <div className="modal-overlay">
        <div className="confirm-modal glass">
          <div className="modal-icon-wrapper">
            <Info size={32} />
          </div>
          <h3>Konfirmasi Mulai Monev</h3>
          <p>Dengan mengklik "Ya", Anda menyatakan secara resmi memulai proses Monev di sekolah ini. <strong>Status ini tidak dapat dibatalkan</strong> oleh Anda dan akan tercatat di sistem pusat.</p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>Batal</button>
            <button className="btn-primary" onClick={confirmUnlock}>Ya, Mulai Monev</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Step3Form;
