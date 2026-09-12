import React, { useState, useMemo, startTransition } from 'react';
import { Search, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SearchWorker from '../../workers/schoolSearchWorker?worker';
import PaginationControl from '../PaginationControl';
import DebouncedSearchInput from '../DebouncedSearchInput'; // Added import
import './Step1SchoolSearch.css';

const Step1SchoolSearch = ({ onNext }) => {
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [citiesByRegion, setCitiesByRegion] = useState({});
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 is usually better for tables than 8

  const workerRef = React.useRef(null);

  React.useEffect(() => {
    workerRef.current = new SearchWorker();
    
    workerRef.current.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'DATA_LOADED') {
        setRegions(payload.GLOBAL_REGIONS);
        setCitiesByRegion(payload.CITIES_BY_REGION);
        setAllCities(payload.ALL_CITIES);
        setIsDataLoaded(true);
      } else if (type === 'SEARCH_RESULTS') {
        startTransition(() => {
          setFilteredSchools(payload);
          setCurrentPage(1);
          setIsSearching(false);
        });
      }
    };

    const timer = setTimeout(() => {
      workerRef.current.postMessage({ type: 'INIT' });
    }, 400);

    return () => {
      clearTimeout(timer);
      workerRef.current?.terminate();
    };
  }, []);

  React.useEffect(() => {
    if (isDataLoaded && workerRef.current) {
      setIsSearching(true);
      workerRef.current.postMessage({
        type: 'SEARCH',
        payload: {
          searchTerm: searchTerm, // this is now already debounced by DebouncedSearchInput
          regionFilter,
          cityFilter
        }
      });
    }
  }, [searchTerm, regionFilter, cityFilter, isDataLoaded]);

  const cities = useMemo(() => {
    if (regionFilter) {
      return citiesByRegion[regionFilter] ? [...citiesByRegion[regionFilter]].sort() : [];
    }
    return allCities;
  }, [regionFilter, citiesByRegion, allCities]);

  const handleRegionChange = (e) => {
    setRegionFilter(e.target.value);
    setCityFilter('');
  };



  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchools.slice(start, start + itemsPerPage);
  }, [filteredSchools, currentPage]);

  const tbodyRef = React.useRef(null);

  useGSAP(() => {
    const rows = tbodyRef.current?.querySelectorAll('.school-row');
    if (!rows || rows.length === 0) return;
    gsap.fromTo(Array.from(rows), 
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.25,
        stagger: 0.04,
        ease: "power2.out",
        clearProps: "transform,opacity"
      }
    );
  }, { scope: tbodyRef, dependencies: [paginatedSchools] });

  const handleSchoolClick = React.useCallback((e, school) => {
    setSelectedSchool(school);
  }, [setSelectedSchool]);

  return (
    <div className="wizard-step-card gsap-slide-up glass" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Verval-style compact header */}
      <div className="grid-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="header-title">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Pilih Sekolah Sasaran</h2>
        </div>

        <div className="grid-search" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%' }}>
          
          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={regionFilter}
              onChange={handleRegionChange}
              style={{ width: '100%', padding: '0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)' }}
            >
              <option value="">Semua Provinsi</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              disabled={!regionFilter && cities.length > 100}
              style={{ width: '100%', padding: '0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', appearance: 'none', color: 'var(--text-primary)' }}
            >
              <option value="">Semua Kab/Kota</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative', gridColumn: 'auto' }}>
            <DebouncedSearchInput 
              placeholder="Cari NPSN atau Nama..." 
              value={searchTerm}
              onChange={setSearchTerm}
              delay={300}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive" style={{ borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
        <div className="split-table-container" style={{ margin: 0, minWidth: '100%', padding: '0 2rem' }}>
          <div className="split-table-header" style={{ padding: '1.25rem 1.25rem 1.25rem calc(1.25rem + 4px)', borderBottom: '2px solid var(--border-light)' }}>
            <div className="header-data-segment" style={{ display: 'grid', gridTemplateColumns: '1.5fr 3.5fr 3fr', gap: '1rem', width: '100%' }}>
              <div>NPSN</div>
              <div>Nama Sekolah</div>
              <div>Lokasi</div>
            </div>
          </div>
          
          <div style={{ padding: '1rem 0' }}>
            <div className="split-table-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto', padding: '6px', paddingRight: '1rem' }}>
              <div className="split-table-body" ref={tbodyRef}>
                {!isDataLoaded ? (
                  <div style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Memuat database sekolah...</span>
                  </div>
                ) : isSearching ? (
                  <div style={{ textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Mencari sekolah...</span>
                  </div>
                ) : paginatedSchools.length > 0 ? (
                  paginatedSchools.map((school) => {
                    const isSelected = selectedSchool?.NPSN === school.NPSN;
                    return (
                      <div 
                        key={school.NPSN}
                        className="split-table-row school-row"
                        style={{ marginBottom: '0.75rem' }}
                      >
                        <div 
                          className="row-data-segment clickable-segment"
                          onClick={(e) => handleSchoolClick(e, school)}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 3.5fr 3fr',
                            gap: '1rem',
                            width: '100%',
                            border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                            backgroundColor: isSelected ? 'var(--bg-input)' : 'var(--bg-card)',
                            boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
                          }}
                        >
                          <div style={{ color: 'var(--accent-blue)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.95rem', display: 'flex', alignItems: 'center' }}>
                            {school.NPSN}
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                            {school['Nama Satuan Pendidikan']}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                            {school['Kab/Kota']}, {school.Provinsi}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Tidak ada sekolah yang cocok dengan pencarian Anda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredSchools.length > 0 && (
        <PaginationControl 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <div className="wizard-actions" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-light)', margin: 0 }}>
        <button 
          className="btn-primary" 
          disabled={!selectedSchool} 
          onClick={() => onNext(selectedSchool)}
          style={{ padding: '0.75rem 2rem', borderRadius: '50px' }} // Pill shape button
        >
          Lanjut Pilih Kategori <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step1SchoolSearch;
