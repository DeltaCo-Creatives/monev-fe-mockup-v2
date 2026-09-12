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
    const rows = tbodyRef.current?.querySelectorAll('tr.school-row');
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
    gsap.fromTo(e.currentTarget, 
      { backgroundColor: 'rgba(59, 130, 246, 0.2)' }, 
      { backgroundColor: 'rgba(59, 130, 246, 0.05)', duration: 0.3, clearProps: "backgroundColor" }
    );
    setSelectedSchool(school);
  }, [setSelectedSchool]);

  return (
    <div className="wizard-step-card gsap-slide-up glass" style={{ padding: '0', overflow: 'hidden' }}>
      
      {/* Verval-style compact header */}
      <div className="grid-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="header-title">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Pilih Sekolah Sasaran</h2>
        </div>

        <div className="grid-search" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          
          <div style={{ position: 'relative', width: '250px' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={regionFilter}
              onChange={handleRegionChange}
              style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', appearance: 'none' }}
            >
              <option value="">Semua Provinsi</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative', width: '250px' }}>
            <MapPin size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              disabled={!regionFilter && cities.length > 100}
              style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', appearance: 'none' }}
            >
              <option value="">Semua Kab/Kota</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <DebouncedSearchInput 
              placeholder="Cari NPSN atau Nama..." 
              value={searchTerm}
              onChange={setSearchTerm}
              delay={300}
              style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '50px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-input)', outline: 'none', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive" style={{ minHeight: '300px' }}>
        <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NPSN</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nama Sekolah</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lokasi</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'center', borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', width: '100px' }}>Pilih</th>
            </tr>
          </thead>
          <tbody ref={tbodyRef}>
            {!isDataLoaded ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Memuat database sekolah...</span>
                  </div>
                </td>
              </tr>
            ) : isSearching ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Mencari sekolah...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedSchools.length > 0 ? (
              paginatedSchools.map((school) => {
                const isSelected = selectedSchool?.NPSN === school.NPSN;
                return (
                  <tr 
                    key={school.NPSN}
                    className={`school-row ${isSelected ? 'selected-row' : ''}`}
                    onClick={(e) => handleSchoolClick(e, school)}
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'background-color 0.2s',
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      borderBottom: '1px solid var(--border-light)'
                    }}
                  >
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--accent-blue)', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {school.NPSN}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {school['Nama Satuan Pendidikan']}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {school['Kab/Kota']},<br/>{school.Provinsi}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        border: `2px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-light)'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                      }}>
                        {isSelected && <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-blue)', borderRadius: '50%' }} />}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  Tidak ada sekolah yang cocok dengan pencarian Anda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
