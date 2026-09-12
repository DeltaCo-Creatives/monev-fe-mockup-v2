import React, { useState, useMemo, startTransition } from 'react';
import { Search, MapPin, Building, ChevronRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';
import SearchWorker from '../../workers/schoolSearchWorker?worker';
import './Step1SchoolSearch.css';

const MemoizedSchoolCard = React.memo(({ school, isSelected, onClick }) => (
  <div 
    className={`school-card ${isSelected ? 'selected' : ''}`}
    onClick={(e) => onClick(e, school)}
  >
    <div className="school-card-icon">
      <Building size={24} />
    </div>
    <div className="school-card-info">
      <h4>{school['Nama Satuan Pendidikan']}</h4>
      <div className="school-meta">
        <span className="badge">NPSN: {school['NPSN']}</span>
        <span className="text-secondary">{school['Kab/Kota']}, {school['Provinsi']}</span>
      </div>
    </div>
    <div className="school-card-action">
      <div className="radio-circle"></div>
    </div>
  </div>
));

const Step1SchoolSearch = ({ selectedSchool, setSelectedSchool, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const [regions, setRegions] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [citiesByRegion, setCitiesByRegion] = useState({});
  const [filteredSchools, setFilteredSchools] = useState([]);
  
  const workerRef = React.useRef(null);

  React.useEffect(() => {
    // Initialize the Web Worker!
    workerRef.current = new SearchWorker();
    
    // Listen for messages from the Worker
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
          setIsSearching(false);
        });
      }
    };

    // Delay initialization slightly to let CSS entrance animations finish smoothly
    const timer = setTimeout(() => {
      workerRef.current.postMessage({ type: 'INIT' });
    }, 400);

    return () => {
      clearTimeout(timer);
      workerRef.current?.terminate(); // Cleanup worker on unmount
    };
  }, []);

  // Separate debounced state so the input stays snappy
  // and GSAP only fires 300ms AFTER the user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = React.useRef(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val); // Instant: keeps the input visually responsive
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      // startTransition: tells React this re-render is non-urgent.
      // React will prioritize input events over this state update.
      startTransition(() => setDebouncedSearch(val));
    }, 250);
  };

  React.useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // Instant lookup from our precomputed map (now populated by worker)
  const cities = useMemo(() => {
    if (regionFilter) {
      return citiesByRegion[regionFilter] ? [...citiesByRegion[regionFilter]].sort() : [];
    }
    return allCities;
  }, [regionFilter, citiesByRegion, allCities]);

  const handleRegionChange = (e) => {
    setRegionFilter(e.target.value);
    setCityFilter(''); // reset city when region changes
  };

  // Ask the Web Worker to search in the background thread!
  React.useEffect(() => {
    if (isDataLoaded && workerRef.current) {
      setIsSearching(true);
      workerRef.current.postMessage({
        type: 'SEARCH',
        payload: {
          searchTerm: debouncedSearch,
          regionFilter,
          cityFilter
        }
      });
    }
  }, [debouncedSearch, regionFilter, cityFilter, isDataLoaded]);

  const containerRef = React.useRef(null);

  // Animate list only when DEBOUNCED search/filter changes — not on every keystroke
  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('.school-card');
    if (!cards || cards.length === 0) return;
    const visible = Array.from(cards).slice(0, 8);
    gsap.fromTo(visible, 
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
  }, { scope: containerRef, dependencies: [debouncedSearch, regionFilter, cityFilter] });

  // Use useCallback so the function reference stays identical across renders.
  // This is required for React.memo on the child cards to work properly.
  const handleSchoolClick = React.useCallback((e, school) => {
    gsap.fromTo(e.currentTarget, 
      { scale: 0.96 }, 
      { scale: 1, duration: 0.3, ease: "back.out(1.5)", clearProps: "transform" }
    );
    setSelectedSchool(school);
  }, [setSelectedSchool]);

  const renderedSchools = useMemo(() => {
    if (!isDataLoaded) {
      return (
        <div className="empty-results" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
          <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Memuat database sekolah...</p>
        </div>
      );
    }

    if (isSearching) {
      return (
        <div className="empty-results" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
          <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Mencari sekolah...</p>
        </div>
      );
    }
    
    return filteredSchools.length > 0 ? (
      filteredSchools.map((school) => (
        <MemoizedSchoolCard 
          key={school.NPSN} 
          school={school}
          isSelected={selectedSchool?.NPSN === school.NPSN}
          onClick={handleSchoolClick}
        />
      ))
    ) : (
      <div className="empty-results">
        <p>Tidak ada sekolah yang cocok dengan pencarian Anda.</p>
      </div>
    );
  }, [filteredSchools, selectedSchool?.NPSN, isDataLoaded]);


  return (
    <div className="wizard-step-card gsap-slide-up glass" ref={containerRef}>
      <div className="step-header">
        <h2>Cari & Pilih Sekolah</h2>
        <p>Silakan cari sekolah yang akan Anda survei hari ini berdasarkan NPSN, Nama, atau Wilayah.</p>
      </div>

      <div className="search-controls">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Ketik NPSN atau Nama Sekolah..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <div className="filters-container">
          <div className="filter-wrapper">
            <MapPin size={18} className="filter-icon" />
            <select 
              value={regionFilter}
              onChange={handleRegionChange}
              className="filter-select"
            >
              <option value="">Semua Provinsi</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="filter-wrapper">
            <MapPin size={18} className="filter-icon" />
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="filter-select"
              disabled={!regionFilter && cities.length > 100} // Optional UX enhancement
            >
              <option value="">Semua Kab/Kota</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>


      <div className="school-results">
        {renderedSchools}
      </div>

      <div className="wizard-actions" style={{ justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary" 
          disabled={!selectedSchool} 
          onClick={onNext}
        >
          Lanjut Pilih Kategori <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Step1SchoolSearch;
