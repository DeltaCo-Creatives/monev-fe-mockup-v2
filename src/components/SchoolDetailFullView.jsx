import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, User, CheckCircle2, AlertCircle, Clock, FileSpreadsheet, Building } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import AdvancedImageViewer from './AdvancedImageViewer';
import categoriesDataRaw from '../data/categories.json';
import './SchoolDetailFullView.css';

const SchoolDetailFullView = ({ school, onBack }) => {
  const [activeTab, setActiveTab] = useState('instrumen'); // 'instrumen', 'dokumen', 'foto'

  const category = categoriesDataRaw.find(c => c.id === school.categoryId);

  const containerRef = React.useRef(null);

  useGSAP(() => {
    gsap.from(".gsap-slide-up", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.5)",
      clearProps: "all"
    });
  }, { scope: containerRef, dependencies: [activeTab] });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return <span className="status-badge success"><CheckCircle2 size={14}/> Selesai</span>;
      case 'Kendala': return <span className="status-badge error"><AlertCircle size={14}/> Ada Kendala</span>;
      case 'Proses': return <span className="status-badge warning"><Clock size={14}/> Sedang Proses</span>;
      default: return <span className="status-badge pending"><Clock size={14}/> Belum Mulai</span>;
    }
  };

  // Mock Images for the gallery
  const mockRoomImages = [
    { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80', label: 'Tampak Depan' },
    { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80', label: 'Ruang Kelas' },
    { url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80', label: 'Tampak Samping' },
    { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80', label: 'Toilet Siswa' }
  ];

  const mockAdminImages = [
    { url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80', label: 'Dokumen Perencanaan' },
    { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80', label: 'Surat Pernyataan' }
  ];

  return (
    <div className="sdfs-container gsap-slide-up" ref={containerRef}>
      {/* Top Header / Navigation */}
      <div className="sdfs-header glass">
        <button className="sdfs-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>
        <div className="sdfs-title-area">
          <div className="sdfs-title-top">
            <span className="sdfs-program-label">{category ? category.name : 'Unknown Program'}</span>
          </div>
          <h1>{school.nama}</h1>
          <div className="sdfs-meta">
            <span className="font-mono">NPSN: {school.npsn}</span>
            <span><MapPin size={14}/> {school.kabupaten}, {school.provinsi}</span>
            {getStatusBadge(school.status)}
          </div>
        </div>
      </div>

      <div className="sdfs-content-wrapper">
        {/* Left Column: Info & Summary */}
        <div className="sdfs-sidebar">
          <div className="sdfs-card glass">
            <h3>Informasi Pelaksanaan</h3>
            <ul className="sdfs-info-list">
              <li>
                <Calendar size={18} className="icon" />
                <div>
                  <label>Tanggal Survei</label>
                  <p>{school.tanggalSurvei ? new Date(school.tanggalSurvei).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</p>
                </div>
              </li>
              <li>
                <User size={18} className="icon" />
                <div>
                  <label>Petugas Lapangan</label>
                  <p>{school.petugas}</p>
                </div>
              </li>
              {school.kendala && (
                <li className="kendala-item">
                  <AlertCircle size={18} className="icon error-color" />
                  <div>
                    <label className="error-color">Catatan Kendala</label>
                    <p>{school.kendala}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column: Deep Data */}
        <div className="sdfs-main-content">
          <div className="sdfs-tabs glass">
            <button className={activeTab === 'instrumen' ? 'active' : ''} onClick={() => setActiveTab('instrumen')}>Data Instrumen</button>
            <button className={activeTab === 'foto' ? 'active' : ''} onClick={() => setActiveTab('foto')}>Foto & Dokumentasi</button>
            <button className={activeTab === 'dokumen' ? 'active' : ''} onClick={() => setActiveTab('dokumen')}>Bukti File</button>
          </div>

          <div className="sdfs-tab-content">
            {activeTab === 'instrumen' && (
              <div className="sdfs-card glass gsap-slide-up">
                <div className="sdfs-card-header">
                  <h3>Hasil Pengisian Instrumen</h3>
                </div>
                <div className="sdfs-table-responsive">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Pertanyaan Survei</th>
                        <th>Jawaban Lapangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category?.questions.map((q, idx) => (
                        <tr key={q.id}>
                          <td>{idx + 1}</td>
                          <td style={{ maxWidth: '400px', whiteSpace: 'normal', color: 'var(--text-secondary)' }}>{q.label}</td>
                          <td className="fw-bold">
                            {/* Mocking Answers based on type */}
                            {q.type === 'boolean' ? (
                              <span style={{ color: 'var(--accent-green)' }}>Sudah / Sesuai</span>
                            ) : q.type === 'select' ? (
                              q.options[Math.floor(Math.random() * q.options.length)]
                            ) : (
                              'Data terisi dari lapangan'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'foto' && (
              <div className="gsap-slide-up">
                <div className="sdfs-card glass" style={{ padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                  <AdvancedImageViewer images={mockRoomImages} title="Foto Ruangan Kelas" />
                  <AdvancedImageViewer images={mockAdminImages} title="Foto Dokumen Fisik" />
                </div>
              </div>
            )}

            {activeTab === 'dokumen' && (
              <div className="sdfs-card glass gsap-slide-up">
                <div className="sdfs-card-header">
                  <h3>Dokumen Administrasi (Excel/PDF)</h3>
                </div>
                <div className="sdfs-doc-list">
                  <div className="sdfs-doc-item">
                    <div className="doc-icon"><FileSpreadsheet size={24} color="#10b981" /></div>
                    <div className="doc-info">
                      <h4>Rekapitulasi_Data_Pendataan.xlsx</h4>
                      <p>1.2 MB • Diupload {school.tanggalSurvei || '12 Mei 2024'}</p>
                    </div>
                    <button className="btn-secondary">Unduh</button>
                  </div>
                  <div className="sdfs-doc-item">
                    <div className="doc-icon"><Building size={24} color="#3b82f6" /></div>
                    <div className="doc-info">
                      <h4>Site_Plan_Sekolah.pdf</h4>
                      <p>4.5 MB • Diupload {school.tanggalSurvei || '12 Mei 2024'}</p>
                    </div>
                    <button className="btn-secondary">Unduh</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetailFullView;
