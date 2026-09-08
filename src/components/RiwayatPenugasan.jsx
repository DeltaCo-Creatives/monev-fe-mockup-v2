import React from 'react';
import { ClipboardList, Calendar } from 'lucide-react';
import './RiwayatPenugasan.css';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Selesai': return <span className="status-badge success">Selesai</span>;
    case 'Kendala': return <span className="status-badge danger">Ada Kendala</span>;
    default: return <span className="status-badge neutral">{status}</span>;
  }
};

const RiwayatPenugasan = ({ riwayatData = [] }) => {
  const sorted = [...riwayatData].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="riwayat-container glass">
      <div className="riwayat-header">
        <h3>Riwayat Penugasan</h3>
        <span className="riwayat-count">{sorted.length} survei tercatat</span>
      </div>

      {sorted.length === 0 ? (
        <div className="riwayat-empty">
          <ClipboardList size={32} />
          <p>Belum ada riwayat survei.</p>
        </div>
      ) : (
        <div className="riwayat-list">
          {sorted.map((item) => (
            <div className="riwayat-item" key={item.id}>
              <div className="riwayat-icon">
                <ClipboardList size={18} />
              </div>
              <div className="riwayat-info">
                <h4>{item.sekolah}</h4>
                <p className="riwayat-kategori">{item.kategori}</p>
                <div className="riwayat-meta">
                  <span><Calendar size={13} /> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiwayatPenugasan;
