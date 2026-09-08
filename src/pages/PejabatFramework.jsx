import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Layers, Building2, Target, CheckCircle2, AlertCircle, Search, FileText, ChevronRight, BarChart3, PieChart as PieChartIcon, X, MapPin, Calendar, User, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import './PejabatFramework.css';
import SchoolDetailFullView from '../components/SchoolDetailFullView';
import MonevFormBuilder from '../components/MonevFormBuilder';
import MonevDataViewer from '../components/MonevDataViewer';

const PejabatFramework = ({ role, setRole, debugMode, setDebugMode, categoriesData, setCategoriesData, schoolsData, setSchoolsData, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [selectedCatId, setSelectedCatId] = useState(categoriesData[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailedSchool, setDetailedSchool] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'KENDALA', 'SELESAI'
  
  const [managementSearchTerm, setManagementSearchTerm] = useState('');
  const [managementCatFilter, setManagementCatFilter] = useState('ALL');
  
  const [dashboardPage, setDashboardPage] = useState(1);
  const [managementPage, setManagementPage] = useState(1);
  const itemsPerPage = 10;

  const totalCategories = categoriesData.length;
  const totalSchools = categoriesData.reduce((acc, cat) => acc + cat.stats.totalSchools, 0);
  
  const selectedCat = categoriesData.find(c => c.id === selectedCatId) || categoriesData[0];
  const stats = selectedCat ? selectedCat.stats : null;

  const handleCreateCategory = (newCategory) => {
    setCategoriesData(prev => [newCategory, ...prev]);
    setSelectedCatId(newCategory.id);
    setActiveTab('dashboard');
  };

  const handleStatusChange = (schoolId, newStatus) => {
    const oldSchool = schoolsData.find(s => s.id === schoolId);
    if (!oldSchool || oldSchool.status === newStatus) return;

    const oldStatus = oldSchool.status;
    const catId = oldSchool.categoryId;

    setSchoolsData(prev => prev.map(s => s.id === schoolId ? { ...s, status: newStatus } : s));

    setCategoriesData(prev => prev.map(cat => {
      if (cat.id === catId) {
        const newStats = { ...cat.stats };
        
        if (oldStatus === 'Selesai') newStats.completedSurveys--;
        if (oldStatus === 'Belum') newStats.pendingSurveys--;
        if (oldStatus === 'Kendala') newStats.issuesReported--;
        
        if (newStatus === 'Selesai') newStats.completedSurveys++;
        if (newStatus === 'Belum') newStats.pendingSurveys++;
        if (newStatus === 'Kendala') newStats.issuesReported++;

        return { ...cat, stats: newStats };
      }
      return cat;
    }));
  };

  // Pie Chart Data
  const chartData = stats ? [
    { name: 'Selesai Survei', value: stats.completedSurveys, color: 'var(--accent-green)' },
    { name: 'Belum Survei', value: stats.pendingSurveys, color: 'var(--accent-orange)' }
  ] : [];

  const completionRate = stats && stats.totalSchools > 0 ? Math.round((stats.completedSurveys / stats.totalSchools) * 100) : 0;

  // Mock Bar Chart Data (Regional Progress)
  const regionalData = [
    { name: 'Jawa', selesai: 450, belum: 150 },
    { name: 'Sumatera', selesai: 300, belum: 200 },
    { name: 'Kalimantan', selesai: 150, belum: 100 },
    { name: 'Sulawesi', selesai: 100, belum: 150 },
    { name: 'Papua/Maluku', selesai: 50, belum: 80 }
  ];

  // Filter Table Data
  const tableData = schoolsData
    .filter(school => school.categoryId === selectedCatId)
    .filter(school => {
      if (statusFilter === 'KENDALA') return school.status === 'Kendala';
      if (statusFilter === 'SELESAI') return school.status === 'Selesai';
      return true; // 'ALL'
    })
    .filter(school => 
      school.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
      school.npsn.includes(searchTerm) ||
      school.provinsi.toLowerCase().includes(searchTerm.toLowerCase())
    );

  useEffect(() => {
    setDashboardPage(1);
  }, [searchTerm, selectedCatId, statusFilter]);

  const totalDashboardPages = Math.ceil(tableData.length / itemsPerPage);
  const currentDashboardPage = Math.min(Math.max(1, dashboardPage), Math.max(1, totalDashboardPages));
  const paginatedTableData = tableData.slice((currentDashboardPage - 1) * itemsPerPage, currentDashboardPage * itemsPerPage);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return <span className="status-badge success">Selesai</span>;
      case 'Proses': return <span className="status-badge warning">Sedang Proses</span>;
      case 'Kendala': return <span className="status-badge danger">Ada Kendala</span>;
      default: return <span className="status-badge neutral">Belum Mulai</span>;
    }
  };

  const generateMockAnswers = (category, school) => {
    if (school.status === 'Belum' || school.status === 'Kendala') return [];
    return category.questions.map((q, i) => {
      let answer = 'Data terisi dari lapangan';
      if (q.type === 'boolean') answer = i % 2 === 0 ? 'Ya' : 'Tidak';
      if (q.type === 'select' && q.options) answer = q.options[0];
      return { label: q.label, answer };
    });
  };

  useEffect(() => {
    setManagementPage(1);
  }, [managementSearchTerm, managementCatFilter]);

  const managementFilteredData = schoolsData
    .filter(s => managementCatFilter === 'ALL' || s.categoryId === managementCatFilter)
    .filter(s => s.nama.toLowerCase().includes(managementSearchTerm.toLowerCase()) || s.npsn.includes(managementSearchTerm));
    
  const totalManagementPages = Math.ceil(managementFilteredData.length / itemsPerPage);
  const currentManagementPage = Math.min(Math.max(1, managementPage), Math.max(1, totalManagementPages));
  const paginatedManagementData = managementFilteredData.slice((currentManagementPage - 1) * itemsPerPage, currentManagementPage * itemsPerPage);

  return (
    <>
      <Layout role={role} setRole={setRole} title={activeTab === 'dashboard' ? 'Command Center (Directorate)' : 'Manajemen Status Sekolah'} debugMode={debugMode} setDebugMode={setDebugMode} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout}>
        
        {detailedSchool ? (
          <SchoolDetailFullView school={detailedSchool} onBack={() => setDetailedSchool(null)} />
        ) : activeTab === 'dashboard' ? (
          <>
            {/* 1. Global Overview Metrics */}
        <div className="global-stats-bar slide-up-1">
          <div className="global-stat glass">
            <div className="global-stat-icon"><Layers size={24} /></div>
            <div className="global-stat-info">
              <span>Total Kategori Monev Aktif</span>
              <strong>{totalCategories}</strong>
            </div>
          </div>
          <div className="global-stat glass">
            <div className="global-stat-icon"><Building2 size={24} /></div>
            <div className="global-stat-info">
              <span>Total Sekolah Sasaran Nasional</span>
              <strong>{totalSchools.toLocaleString('id-ID')}</strong>
            </div>
          </div>
        </div>

        {/* 2. Modern Category Selector Cards */}
        <div className="section-title slide-up-2">
          <h3>Program Monitoring & Evaluasi</h3>
          <p>Pilih program untuk melihat analitik dan progres lapangan.</p>
        </div>
        
        <div className="category-cards-container slide-up-2">
          {categoriesData.map(cat => (
            <div 
              key={cat.id} 
              className={`category-select-card glass ${selectedCatId === cat.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCatId(cat.id);
                setStatusFilter('ALL'); // Reset filter on category change
              }}
            >
              <div className="card-header">
                <Target size={20} className="card-icon" />
                <span className="card-completion">{cat.stats.totalSchools > 0 ? Math.round((cat.stats.completedSurveys / cat.stats.totalSchools) * 100) : 0}%</span>
              </div>
              <h4>{cat.name}</h4>
              <div className="card-mini-stats">
                <span>{cat.stats.completedSurveys} / {cat.stats.totalSchools} Sekolah</span>
              </div>
              {selectedCatId === cat.id && <div className="active-indicator"></div>}
            </div>
          ))}
        </div>

        {/* 3. Dynamic Category Analytics View */}
        {selectedCat && (
          <div className="category-dashboard animate-fade-in slide-up-3">
            
            <div className="analytics-grid">
              
              {/* Left: Overall Progress (Donut Chart) */}
              <div className="analytics-card glass">
                <div className="card-title">
                  <PieChartIcon size={18} />
                  <h4>Progres Keseluruhan</h4>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--bg-card)' }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-center-label">
                    <h2>{completionRate}%</h2>
                    <span>Tercapai</span>
                  </div>
                </div>
                <div className="cat-progress-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--accent-green)'}}></div>
                    <span>Sudah Survei: <strong>{stats.completedSurveys.toLocaleString('id-ID')}</strong></span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--accent-orange)'}}></div>
                    <span>Belum Survei: <strong>{stats.pendingSurveys.toLocaleString('id-ID')}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right: Regional Progress (Bar Chart) */}
              <div className="analytics-card glass">
                <div className="card-title">
                  <BarChart3 size={18} />
                  <h4>Sebaran Wilayah</h4>
                </div>
                <div className="bar-chart-wrapper" style={{ height: '300px', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                      <Bar dataKey="selesai" name="Selesai" stackId="a" fill="var(--accent-green)" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="belum" name="Belum" stackId="a" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Quick Metrics Row - Now Clickable Filters */}
            <div className="quick-metrics-row">
              <div 
                className={`cat-stat-card glass slide-up-4 clickable-metric ${statusFilter === 'ALL' ? 'active-metric-filter' : ''}`}
                onClick={() => setStatusFilter('ALL')}
              >
                <Target size={24} color="var(--accent-blue)" className="metric-icon" />
                <div className="cat-stat-data">
                  <span>Target Satuan Pendidikan</span>
                  <h3>{stats.totalSchools.toLocaleString('id-ID')}</h3>
                </div>
              </div>
              <div 
                className={`cat-stat-card glass slide-up-4 clickable-metric ${statusFilter === 'KENDALA' ? 'active-metric-filter' : ''}`} 
                style={{ animationDelay: '0.1s' }}
                onClick={() => setStatusFilter('KENDALA')}
              >
                <AlertCircle size={24} color="var(--accent-red)" className="metric-icon" />
                <div className="cat-stat-data">
                  <span>Kendala Dilaporkan Lapangan</span>
                  <h3>{stats.issuesReported} Kasus</h3>
                </div>
              </div>
              <div 
                className={`cat-stat-card glass slide-up-4 clickable-metric ${statusFilter === 'SELESAI' ? 'active-metric-filter' : ''}`} 
                style={{ animationDelay: '0.2s' }}
                onClick={() => setStatusFilter('SELESAI')}
              >
                <CheckCircle2 size={24} color="var(--accent-green)" className="metric-icon" />
                <div className="cat-stat-data">
                  <span>Instrumen Tervalidasi</span>
                  <h3>{(stats.completedSurveys - Math.floor(stats.completedSurveys * 0.1)).toLocaleString('id-ID')}</h3>
                </div>
              </div>
            </div>

            {/* 4. Interactive Data Grid */}
            <div className="data-grid-container glass slide-up-5">
              <div className="grid-header">
                <div className="grid-title">
                  <FileText size={20} />
                  <h3>Rincian Data Sekolah ({selectedCat.name}) {statusFilter !== 'ALL' && <span className="filter-badge">({statusFilter})</span>}</h3>
                </div>
                <div className="grid-search">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Cari NPSN, Nama, atau Wilayah..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>NPSN</th>
                      <th>Nama Sekolah</th>
                      <th>Wilayah</th>
                      <th>Status</th>
                      <th>Tgl Survei</th>
                      <th>Petugas</th>
                      <th>Lihat Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTableData.length > 0 ? (
                      paginatedTableData.map(school => (
                        <tr key={school.id} onClick={() => setDetailedSchool(school)} className="clickable-row">
                          <td className="font-mono">{school.npsn}</td>
                          <td className="fw-bold">{school.nama}</td>
                          <td>{school.kabupaten}, {school.provinsi}</td>
                          <td>{getStatusBadge(school.status)}</td>
                          <td>{school.tanggalSurvei ? new Date(school.tanggalSurvei).toLocaleDateString('id-ID') : '-'}</td>
                          <td>{school.petugas}</td>
                          <td>
                            <button className="btn-icon-only" title="Lihat Detail">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="empty-table">
                          <div className="empty-state">
                            <Search size={32} />
                            <p>Tidak ada data sekolah yang cocok dengan pencarian "{searchTerm}".</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControl 
                currentPage={currentDashboardPage} 
                totalPages={totalDashboardPages} 
                onPageChange={setDashboardPage} 
              />
            </div>

          </div>
        )}
        </>
        ) : activeTab === 'management' ? (
          <div className="management-view animate-fade-in slide-up-1">
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
                      placeholder="Cari berdasarkan NPSN atau Nama Sekolah..." 
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
        ) : activeTab === 'create' ? (
          <MonevFormBuilder 
            onSave={handleCreateCategory} 
            onCancel={() => setActiveTab('dashboard')} 
          />
        ) : activeTab === 'data' ? (
          <MonevDataViewer 
            categoriesData={categoriesData} 
            schoolsData={schoolsData} 
          />
        ) : null}
      </Layout>

    </>
  );
};

export default PejabatFramework;

const PaginationControl = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  const handleInputSubmit = (e) => {
    if (e) e.preventDefault();
    const pageNum = parseInt(inputPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  return (
    <div className="pagination-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '1rem', gap: '0.75rem', borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
      <button 
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: currentPage <= 1 ? 'var(--bg-main)' : 'var(--bg-input)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}
      >
        Prev
      </button>
      
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Page</span>
      
      <form onSubmit={handleInputSubmit} style={{ margin: 0 }}>
        <input 
          type="number" 
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onBlur={handleInputSubmit}
          min={1}
          max={totalPages || 1}
          style={{ width: '60px', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-light)', textAlign: 'center', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem', outline: 'none' }}
        />
      </form>
      
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>of {totalPages || 1}</span>

      <button 
        disabled={currentPage >= totalPages || totalPages === 0}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-light)', backgroundColor: currentPage >= totalPages || totalPages === 0 ? 'var(--bg-main)' : 'var(--bg-input)', cursor: currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer', color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.85rem' }}
      >
        Next
      </button>
    </div>
  );
};

