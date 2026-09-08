import React, { useState } from 'react';
import { Search, MapPin, Building, ChevronRight } from 'lucide-react';
import schoolData from '../../data/schools.json';
import './Step1SchoolSearch.css';

const Step1SchoolSearch = ({ selectedSchool, setSelectedSchool, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Extract unique regions (Provinsi)
  const regions = [...new Set(schoolData.map(s => s['Provinsi']))].filter(Boolean).sort();

  // Extract unique cities (Kab/Kota) based on selected Province
  const cities = [...new Set(
    schoolData
      .filter(s => !regionFilter || s['Provinsi'] === regionFilter)
      .map(s => s['Kab/Kota'])
  )].filter(Boolean).sort();

  const handleRegionChange = (e) => {
    setRegionFilter(e.target.value);
    setCityFilter(''); // Reset city when province changes
  };

  const filteredSchools = schoolData.filter(s => {
    const matchesSearch = (s['Nama Satuan Pendidikan'] || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s['NPSN'] || '').includes(searchTerm);
    const matchesRegion = regionFilter ? s['Provinsi'] === regionFilter : true;
    const matchesCity = cityFilter ? s['Kab/Kota'] === cityFilter : true;
    return matchesSearch && matchesRegion && matchesCity;
  }).slice(0, 50); // Limit to 50 for performance in mockup

  return (
    <div className="wizard-step-card animate-fade-in glass">
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
        {filteredSchools.length > 0 ? (
          filteredSchools.map((school, idx) => (
            <div 
              key={idx} 
              className={`school-card ${selectedSchool?.NPSN === school.NPSN ? 'selected' : ''}`}
              onClick={() => setSelectedSchool(school)}
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
          ))
        ) : (
          <div className="empty-results">
            <p>Tidak ada sekolah yang cocok dengan pencarian Anda.</p>
          </div>
        )}
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
