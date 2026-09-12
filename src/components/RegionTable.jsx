import React from 'react';
import './RegionTable.css';
import { ChevronRight, Search, Info } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const RegionTable = ({ data }) => {
  const [tableRef] = useAutoAnimate();
  return (
    <div className="region-container glass">
      <div className="region-header">
        <div className="region-tabs">
          <button className="tab active">Overview & Region</button>
          <button className="tab">Daftar Sekolah Sasaran</button>
        </div>
      </div>
      
      <div className="region-content">
        <div className="table-controls">
          <div className="table-title">
            <h3>Distribusi Sekolah per Wilayah | Menu Sekolah</h3>
            <div className="info-text">
              <Info size={14} color="#94a3b8" />
              <span>Ketuk/klik baris wilayah untuk melihat rincian hingga tingkat sekolah.</span>
            </div>
          </div>
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input type="text" placeholder="Cari wilayah atau sekolah..." />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="region-table">
            <thead>
              <tr>
                <th>WILAYAH / SEKOLAH</th>
                <th className="text-center">TOTAL SEKOLAH</th>
                <th className="text-center">SELESAI</th>
                <th className="text-left">PROGRESS</th>
              </tr>
            </thead>
            <tbody ref={tableRef}>
              {data.map((row, index) => (
                <tr key={index}>
                  <td className="col-wilayah">
                    <button className="expand-btn">
                      <ChevronRight size={16} />
                    </button>
                    <span>{row.name}</span>
                  </td>
                  <td className="text-center font-medium">{row.total}</td>
                  <td className="text-center font-medium">{row.selesai}</td>
                  <td className="col-progress">
                    <div className="progress-container">
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${(row.selesai / row.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {Math.round((row.selesai / row.total) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegionTable;
