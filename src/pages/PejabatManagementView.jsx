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

        <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
          <table className="premium-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--bg-card)' }}>
              <tr>
                <th>NPSN</th>
                <th>Nama Sekolah</th>
                <th>Program</th>
                <th>Status Saat Ini</th>
                <th>Override Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedManagementData
                .map(school => (
                  <tr key={school.id} onClick={() => navigate(`school/${school.npsn}`)} className="clickable-row">
                    <td className="font-mono">{school.npsn}</td>
                    <td className="fw-bold">{school.nama}</td>
                    <td>{categoriesData.find(c => c.id === school.categoryId)?.name}</td>
                    <td>{getStatusBadge(school.status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select 
                        className="status-override-select"
                        value={school.status}
                        onChange={(e) => handleStatusChange(school.id, e.target.value)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-light)', 
                          backgroundColor: 'var(--bg-input)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          outline: 'none'
                        }}
                      >
                        <option value="Belum">Belum Mulai</option>
                        <option value="Proses">Sedang Proses</option>
                        <option value="Kendala">Ada Kendala</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
