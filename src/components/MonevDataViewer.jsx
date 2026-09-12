import React, { useState } from 'react';
import { Download, Target, Search } from 'lucide-react';
import '../pages/PejabatFramework.css';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const MonevDataViewer = ({ categoriesData, schoolsData }) => {
  const [tableRef] = useAutoAnimate();
  const [selectedCatId, setSelectedCatId] = useState(categoriesData[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = categoriesData.find(c => c.id === selectedCatId) || categoriesData[0];
  
  if (!selectedCategory) {
    return <div style={{ padding: '2rem' }}>Tidak ada data kategori Monev.</div>;
  }


  // Get dynamic questions to form columns
  const questions = selectedCategory.questions || [];

  // Filter schools mapped to this category
  const filteredSchools = schoolsData
    .filter(s => s.categoryId === selectedCatId)
    .filter(s => 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.npsn.includes(searchTerm)
    );

  const downloadCSV = () => {
    if (filteredSchools.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // 1. Build Header Row
    const baseHeaders = ['NPSN', 'Nama Sekolah', 'Provinsi', 'Kab/Kota', 'Status', 'Tanggal Survei', 'Nama Petugas'];
    const dynamicHeaders = questions.map(q => q.label);
    const allHeaders = [...baseHeaders, ...dynamicHeaders];

    // 2. Build Data Rows
    const csvRows = [allHeaders.join(',')];

    filteredSchools.forEach(school => {
      const baseRow = [
        school.npsn,
        `"${school.nama}"`,
        `"${school.provinsi}"`,
        `"${school.kabupaten}"`,
        school.status,
        school.tanggalSurvei ? new Date(school.tanggalSurvei).toLocaleDateString('id-ID') : '-',
        `"${school.petugas || '-'}"`
      ];

      const answers = school.answers || {};
      const dynamicRow = questions.map(q => {
        let val = answers[q.id];
        // Handle fallback for kepsek/hp/pengawas if mapped differently (hardcoded in Step3)
        // If not in `answers` directly, we might check known aliases from the form
        if (!val) {
          if (q.label.toLowerCase().includes('kepala sekolah') && !q.label.toLowerCase().includes('surat')) {
            val = answers['kepsek'] || answers['hp'] || '-';
          } else if (q.label.toLowerCase().includes('pengawas')) {
            val = answers['pengawas'] || '-';
          } else {
            val = '-';
          }
        }
        
        // Escape quotes for CSV
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });

      csvRows.push([...baseRow, ...dynamicRow].join(','));
    });

    // 3. Create Blob and Trigger Download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Monev_${selectedCategory.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="gsap-slide-up" ref={containerRef} style={{ padding: '0 0.5rem' }}>
      <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Data & Ekspor Laporan</h3>
          <p>Lihat data mentah survei lapangan dan unduh dalam format CSV.</p>
        </div>
        <button className="btn-primary" onClick={downloadCSV} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Download size={18} /> Download CSV
        </button>
      </div>

      {/* Controls */}
      <div className="data-grid-container glass gsap-slide-up">
        <div className="grid-header" style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: 'none', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Target size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer', appearance: 'none' }}
            >
              {categoriesData.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>▼</div>
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Cari NPSN atau Nama..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none' }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', overflowX: 'auto' }}>
          <table className="premium-table" style={{ whiteSpace: 'nowrap' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-card)' }}>
              <tr>
                <th>NPSN</th>
                <th>Nama Sekolah</th>
                <th>Status</th>
                <th>Tanggal Survei</th>
                {questions.map((q, i) => (
                  <th key={i}>{q.label.length > 30 ? q.label.substring(0, 30) + '...' : q.label}</th>
                ))}
              </tr>
            </thead>
            <tbody ref={tableRef}>
            {filteredSchools.length > 0 ? (
              filteredSchools.map((school) => {
                const answers = school.answers || {};
                return (
                  <tr key={school.id}>
                    <td><strong>{school.npsn}</strong></td>
                    <td>{school.nama}</td>
                    <td>
                      <span className={`status-badge ${school.status === 'Selesai' ? 'success' : school.status === 'Kendala' ? 'danger' : 'neutral'}`}>
                        {school.status}
                      </span>
                    </td>
                    <td>{school.tanggalSurvei ? new Date(school.tanggalSurvei).toLocaleDateString('id-ID') : '-'}</td>
                    
                    {questions.map((q, i) => {
                      let val = answers[q.id];
                      if (!val) {
                        if (q.label.toLowerCase().includes('kepala sekolah') && !q.label.toLowerCase().includes('surat')) {
                          val = answers['kepsek'] || '-';
                        } else if (q.label.toLowerCase().includes('pengawas')) {
                          val = answers['pengawas'] || '-';
                        } else {
                          val = '-';
                        }
                      }
                      return (
                        <td key={i}>
                          <span style={{ 
                            display: 'inline-block', 
                            maxWidth: '200px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }} title={val}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4 + questions.length} style={{ textAlign: 'center', padding: '3rem' }}>
                  Tidak ada data sekolah yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default MonevDataViewer;
