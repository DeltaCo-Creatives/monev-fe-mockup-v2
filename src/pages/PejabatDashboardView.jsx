import React, { useState, useEffect, useMemo, startTransition } from 'react';
import { Layers, Building2, Target, CheckCircle2, AlertCircle, Search, FileText, ChevronRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import PaginationControl from '../components/PaginationControl';
import DebouncedSearchInput from '../components/DebouncedSearchInput';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const MemoizedAnalyticsGrid = React.memo(({ chartData, completionRate, stats, regionalData }) => {
  return (
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
  );
});

const PejabatDashboardView = ({ categoriesData, schoolsData }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tableRef] = useAutoAnimate();
  const selectedCatId = searchParams.get('category') || categoriesData[0]?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const statusFilter = searchParams.get('status') || 'ALL';
  const [dashboardPage, setDashboardPage] = useState(1);
  const itemsPerPage = 10;

  const totalCategories = categoriesData.length;
  const totalSchools = categoriesData.reduce((acc, cat) => acc + cat.stats.totalSchools, 0);
  
  const selectedCat = categoriesData.find(c => c.id === selectedCatId) || categoriesData[0];
  const stats = selectedCat ? selectedCat.stats : null;

  // Pie Chart Data
  const chartData = useMemo(() => stats ? [
    { name: 'Selesai Survei', value: stats.completedSurveys, color: 'var(--accent-green)' },
    { name: 'Belum Survei', value: stats.pendingSurveys, color: 'var(--accent-orange)' }
  ] : [], [stats]);

  const completionRate = stats && stats.totalSchools > 0 ? Math.round((stats.completedSurveys / stats.totalSchools) * 100) : 0;

  // Mock Bar Chart Data (Regional Progress)
  const regionalData = useMemo(() => [
    { name: 'Jawa', selesai: 450, belum: 150 },
    { name: 'Sumatera', selesai: 300, belum: 200 },
    { name: 'Kalimantan', selesai: 150, belum: 100 },
    { name: 'Sulawesi', selesai: 100, belum: 150 },
    { name: 'Papua/Maluku', selesai: 50, belum: 80 }
  ], []);

  // Filter Table Data
  const tableData = useMemo(() => {
    return schoolsData
      .filter(school => school.categoryId === selectedCatId)
      .filter(school => {
        if (statusFilter === 'KENDALA') return school.status === 'Kendala';
        if (statusFilter === 'SELESAI') return school.status === 'Selesai';
        return true; // 'ALL'
      })
      .filter(school => {
        if (!searchTerm) return true;
        return school.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
               school.npsn.includes(searchTerm) ||
               school.provinsi.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [schoolsData, selectedCatId, statusFilter, searchTerm]);

  useEffect(() => {
    setDashboardPage(1);
  }, [searchTerm, selectedCatId, statusFilter]);

  const totalDashboardPages = Math.ceil(tableData.length / itemsPerPage);
  const currentDashboardPage = Math.min(Math.max(1, dashboardPage), Math.max(1, totalDashboardPages));
  const paginatedTableData = useMemo(() => {
    return tableData.slice((currentDashboardPage - 1) * itemsPerPage, currentDashboardPage * itemsPerPage);
  }, [tableData, currentDashboardPage, itemsPerPage]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Selesai': return <span className="status-badge success">Selesai</span>;
      case 'Proses': return <span className="status-badge warning">Sedang Proses</span>;
      case 'Kendala': return <span className="status-badge danger">Ada Kendala</span>;
      default: return <span className="status-badge neutral">Belum Mulai</span>;
    }
  };

  return (
    <>
      {/* 1. Global Overview Metrics */}
      <div className="global-stats-bar gsap-slide-up">
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
      <div className="section-title gsap-slide-up">
        <h3>Program Monitoring & Evaluasi</h3>
        <p>Pilih program untuk melihat analitik dan progres lapangan.</p>
      </div>
      
      <div className="category-cards-container gsap-slide-up">
        {categoriesData.map(cat => (
          <div 
            key={cat.id} 
            className={`category-select-card glass ${selectedCatId === cat.id ? 'active' : ''}`}
            onClick={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.set('category', cat.id);
              newParams.set('status', 'ALL');
              setSearchParams(newParams);
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
        <div className="category-dashboard gsap-slide-up">
          
          <MemoizedAnalyticsGrid 
            chartData={chartData} 
            completionRate={completionRate} 
            stats={stats} 
            regionalData={regionalData} 
          />
          
          {/* Quick Metrics Row - Now Clickable Filters */}
          <div className="quick-metrics-row">
            <div 
              className={`cat-stat-card glass gsap-slide-up clickable-metric ${statusFilter === 'ALL' ? 'active-metric-filter' : ''}`}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('status', 'ALL');
                startTransition(() => setSearchParams(newParams));
              }}
            >
              <Target size={24} color="var(--accent-blue)" className="metric-icon" />
              <div className="cat-stat-data">
                <span>Target Satuan Pendidikan</span>
                <h3>{stats.totalSchools.toLocaleString('id-ID')}</h3>
              </div>
            </div>
            <div 
              className={`cat-stat-card glass gsap-slide-up clickable-metric ${statusFilter === 'KENDALA' ? 'active-metric-filter' : ''}`} 
              style={{ animationDelay: '0.1s' }}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('status', 'KENDALA');
                startTransition(() => setSearchParams(newParams));
              }}
            >
              <AlertCircle size={24} color="var(--accent-red)" className="metric-icon" />
              <div className="cat-stat-data">
                <span>Kendala Dilaporkan Lapangan</span>
                <h3>{stats.issuesReported} Kasus</h3>
              </div>
            </div>
            <div 
              className={`cat-stat-card glass gsap-slide-up clickable-metric ${statusFilter === 'SELESAI' ? 'active-metric-filter' : ''}`} 
              style={{ animationDelay: '0.2s' }}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('status', 'SELESAI');
                startTransition(() => setSearchParams(newParams));
              }}
            >
              <CheckCircle2 size={24} color="var(--accent-green)" className="metric-icon" />
              <div className="cat-stat-data">
                <span>Instrumen Tervalidasi</span>
                <h3>{(stats.completedSurveys - Math.floor(stats.completedSurveys * 0.1)).toLocaleString('id-ID')}</h3>
              </div>
            </div>
          </div>

          {/* 4. Interactive Data Grid */}
          <div className="data-grid-container glass gsap-slide-up">
            <div className="grid-header">
              <div className="grid-title">
                <FileText size={20} />
                <h3>Rincian Data Sekolah ({selectedCat.name}) {statusFilter !== 'ALL' && <span className="filter-badge">({statusFilter})</span>}</h3>
              </div>
              <div className="grid-search">
              <DebouncedSearchInput 
                className="form-input premium-input search-input" 
                placeholder="Cari sekolah..." 
                value={searchTerm}
                onChange={setSearchTerm}
                delay={300}
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
                <tbody ref={tableRef}>
                  {paginatedTableData.length > 0 ? (
                    paginatedTableData.map(school => (
                      <tr key={school.id} onClick={() => setTimeout(() => navigate(`school/${school.npsn}`), 150)} className="clickable-row">
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
              onPageChange={(page) => startTransition(() => setDashboardPage(page))} 
            />
          </div>

        </div>
      )}
    </>
  );
};

export default PejabatDashboardView;
