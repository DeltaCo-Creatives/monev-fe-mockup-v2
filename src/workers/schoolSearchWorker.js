// src/workers/schoolSearchWorker.js

let schoolData = [];
let isDataLoaded = false;
let GLOBAL_REGIONS = [];
let CITIES_BY_REGION = {};
let ALL_CITIES = [];

const loadSchoolData = async () => {
  if (isDataLoaded) return;
  try {
    const res = await fetch('/schools.json');
    const data = await res.json();
    schoolData = data;
    
    // Precompute lookup tables inside the worker
    GLOBAL_REGIONS = [...new Set(data.map(s => s['Provinsi']))].filter(Boolean).sort();
    CITIES_BY_REGION = data.reduce((acc, s) => {
      const prov = s['Provinsi'];
      const city = s['Kab/Kota'];
      if (prov && city) {
        if (!acc[prov]) acc[prov] = new Set();
        acc[prov].add(city);
      }
      return acc;
    }, {});
    
    // Convert Sets back to arrays for serialization
    for (const prov in CITIES_BY_REGION) {
      CITIES_BY_REGION[prov] = [...CITIES_BY_REGION[prov]].sort();
    }
    
    ALL_CITIES = [...new Set(data.map(s => s['Kab/Kota']))].filter(Boolean).sort();
    isDataLoaded = true;
    
    postMessage({
      type: 'DATA_LOADED',
      payload: {
        GLOBAL_REGIONS,
        CITIES_BY_REGION,
        ALL_CITIES
      }
    });
  } catch (error) {
    console.error("Worker failed to load school data:", error);
  }
};

// Handle messages from the Main Thread
self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'INIT') {
    await loadSchoolData();
  }

  if (type === 'SEARCH') {
    if (!isDataLoaded) return; // Ignore if data not ready
    
    const { searchTerm, regionFilter, cityFilter } = payload;
    const lowerSearch = searchTerm.toLowerCase();
    const results = [];

    // Optimized search loop exactly like we had on the main thread, 
    // but now running safely in the background!
    for (let i = 0; i < schoolData.length; i++) {
      const s = schoolData[i];
      if (regionFilter && s['Provinsi'] !== regionFilter) continue;
      if (cityFilter && s['Kab/Kota'] !== cityFilter) continue;
      
      const npsn = s['NPSN'] || '';
      const nama = s['Nama Satuan Pendidikan'] || '';
      
      if (!lowerSearch || npsn.includes(lowerSearch) || nama.toLowerCase().includes(lowerSearch)) {
        results.push(s);
        if (results.length >= 50) break; // Break early to save CPU
      }
    }

    // Send the filtered results back to the Main Thread
    postMessage({
      type: 'SEARCH_RESULTS',
      payload: results
    });
  }
};
