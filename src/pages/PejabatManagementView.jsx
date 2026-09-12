import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { Search } from 'lucide-react';
import PaginationControl from './PaginationControl';
import useDebounce from '../hooks/useDebounce';

const PejabatManagementView = ({ categoriesData, schoolsData, handleStatusChange }) => {
  const [managementSearchTerm, setManagementSearchTerm] = useState('');
  const [managementCatFilter, setManagementCatFilter] = useState('ALL');
  const [managementPage, setManagementPage] = useState(1);
  const itemsPerPage = 10;

  // Debounce the search term to prevent filtering lag
  const debouncedSearchTerm = useDebounce(managementSearchTerm, 300);

  useEffect(() => {
    setManagementPage(1);
  }, [debouncedSearchTerm, managementCatFilter]);

  const managementFilteredData = useMemo(() => {
    return schoolsData
      .filter(s => managementCatFilter === 'ALL' || s.categoryId === managementCatFilter)
      .filter(s => {
        if (!debouncedSearchTerm) return true;
        return s.nama.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
               s.npsn.includes(debouncedSearchTerm);
      });
  }, [schoolsData, managementCatFilter, debouncedSearchTerm]);
    
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
              <Search size={16} className="search-icon" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="form-input premium-input search-input" 
                placeholder="Cari sekolah..." 
                value={managementSearchTerm}
                onChange={(e) => setManagementSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none' }}
              />
            </div>
            <select 
              value={managementCatFilter}
              onChange={(e) => setManagementCatFilter(e.target.value)}
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
                  <tr key={school.id}>
                    <td className="font-mono">{school.npsn}</td>
                    <td className="fw-bold">{school.nama}</td>
                    <td>{categoriesData.find(c => c.id === school.categoryId)?.name}</td>
                    <td>{getStatusBadge(school.status)}</td>
                    <td>
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
