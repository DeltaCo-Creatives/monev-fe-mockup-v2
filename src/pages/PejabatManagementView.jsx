import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { Search } from 'lucide-react';
import PaginationControl from '../components/PaginationControl';
import DebouncedSearchInput from '../components/DebouncedSearchInput';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PejabatManagementView = ({ categoriesData, schoolsData, handleStatusChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [managementSearchTerm, setManagementSearchTerm] = useState('');
  const managementCatFilter = searchParams.get('category') || 'ALL';
  const [managementPage, setManagementPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setManagementPage(1);
  }, [managementSearchTerm, managementCatFilter]);

  const managementFilteredData = useMemo(() => {
    return schoolsData
      .filter(s => managementCatFilter === 'ALL' || s.categoryId === managementCatFilter)
      .filter(s => {
        if (!managementSearchTerm) return true;
        return s.nama.toLowerCase().includes(managementSearchTerm.toLowerCase()) || 
               s.npsn.includes(managementSearchTerm);
      });
  }, [schoolsData, managementCatFilter, managementSearchTerm]);
    
  const totalManagementPages = Math.ceil(managementFilteredData.length / itemsPerPage);
  const currentManagementPage = Math.min(Math.max(1, managementPage), Math.max(1, totalManagementPages));
  const paginatedManagementData = useMemo(() => {
    return managementFilteredData.slice((currentManagementPage - 1) * itemsPerPage, currentManagementPage * itemsPerPage);
  }, [managementFilteredData, currentManagementPage, itemsPerPage]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return <span className="status-badge success">Selesai</span>;
      case 'Proses': return <span className="status-badge warning">Sedang Proses</span>;
      case 'Kendala': return <span className="status-badge danger">Ada Kendala</span>;
      default: return <span className="status-badge neutral">Belum Mulai</span>;
    }
  };

  return (
    <div className="management-view gsap-slide-up">
      <div className="section-title">
        <h3>Manajemen Override Status</h3>
        <p>Ubah status sekolah secara manual jika diperlukan. Perubahan akan langsung memengaruhi metrik di Dashboard Kategori.</p>
      </div>
      
      <div className="data-grid-container glass">
        <div className="grid-header">
          <div className="grid-search" style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: 'none' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <DebouncedSearchInput 
                className="form-input premium-input search-input" 
                placeholder="Cari sekolah..." 
                value={managementSearchTerm}
                onChange={setManagementSearchTerm}
                delay={300}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none' }}
              />
            </div>
            <select 
              value={managementCatFilter}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('category', e.target.value);
                setSearchParams(newParams);
              }}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">Semua Kategori Program</option>
              {categoriesData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="table-responsive" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)' }}>
          <div className="split-table-container" style={{ margin: 0 }}>
            <div className="split-table-header" style={{ padding: '1.25rem', borderBottom: '2px solid var(--border-light)' }}>
              <div className="header-data-segment">
                <div style={{ flex: '1 1 15%' }}>NPSN</div>
                <div style={{ flex: '1 1 30%' }}>Nama Sekolah</div>
                <div style={{ flex: '1 1 35%' }}>Program</div>
                <div style={{ flex: '1 1 20%' }}>Status Saat Ini</div>
              </div>
              <div className="header-action-segment">
                <div>Override Status</div>
              </div>
            </div>
            
            <div style={{ padding: '1rem 1.25rem' }}>
              <div className="split-table-scroll-area" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div className="split-table-body">
                  {paginatedManagementData.length > 0 ? (
                    paginatedManagementData.map(school => (
                      <div key={school.id} className="split-table-row">
                        <div 
                          className="row-data-segment clickable-segment"
                          onClick={() => setTimeout(() => navigate(`school/${school.npsn}`), 150)}
                        >
                          <div style={{ flex: '1 1 15%' }} className="font-mono">{school.npsn}</div>
                          <div style={{ flex: '1 1 30%' }} className="fw-bold">{school.nama}</div>
                          <div style={{ flex: '1 1 35%' }}>{categoriesData.find(c => c.id === school.categoryId)?.name}</div>
                          <div style={{ flex: '1 1 20%' }}>{getStatusBadge(school.status)}</div>
                        </div>
                        
                        <div className="row-action-segment">
                          <select 
                            className="status-override-select"
                            value={school.status}
                            onChange={(e) => handleStatusChange(school.id, e.target.value)}
                            style={{ 
                              width: '100%',
                              padding: '8px 12px', 
                              borderRadius: '6px', 
                              border: '1px solid var(--accent-blue-light)', 
                              backgroundColor: 'var(--bg-input)',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              color: 'var(--accent-blue)',
                              outline: 'none',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <option value="Belum">Belum Mulai</option>
                            <option value="Proses">Sedang Proses</option>
                            <option value="Kendala">Ada Kendala</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state" style={{ padding: '3rem' }}>
                      <Search size={32} />
                      <p>Tidak ada data sekolah yang cocok dengan pencarian.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <PaginationControl 
          currentPage={currentManagementPage} 
          totalPages={totalManagementPages} 
          onPageChange={setManagementPage} 
        />
      </div>
    </div>
  );
};

export default PejabatManagementView;
