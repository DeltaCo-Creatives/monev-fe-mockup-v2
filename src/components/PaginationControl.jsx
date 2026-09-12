import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControl = ({ currentPage, totalPages, onPageChange }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); // Now safe because passive is false
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Helper for premium pagination layout (1 2 3 ... 8)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div 
      className="pagination-container" 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start', // Changed to flex-start so it scrolls correctly
        gap: '0.25rem', 
        padding: '1rem', 
        borderTop: '1px solid var(--border-light)', 
        backgroundColor: 'var(--bg-card)', 
        borderBottomLeftRadius: 'var(--radius-xl)', 
        borderBottomRightRadius: 'var(--radius-xl)',
        overflowX: 'auto', // Enable horizontal scrolling
        whiteSpace: 'nowrap',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', // Hide scrollbar for cleaner look
        msOverflowStyle: 'none'
      }}
    >
      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        title="Halaman Sebelumnya"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: currentPage <= 1 ? 'var(--bg-main)' : 'var(--bg-input)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={18} />
      </button>
      
      {getPageNumbers().map((p, i) => (
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', color: 'var(--text-secondary)' }}>...</span>
        ) : (
          <button 
            key={p}
            className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', 
              border: currentPage === p ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)', 
              backgroundColor: currentPage === p ? 'var(--accent-blue)' : 'var(--bg-input)', 
              color: currentPage === p ? 'white' : 'var(--text-primary)',
              fontWeight: currentPage === p ? '600' : '400',
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        )
      ))}

      <button 
        className="pagination-btn" 
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        title="Halaman Selanjutnya"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: currentPage >= totalPages ? 'var(--bg-main)' : 'var(--bg-input)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', color: 'var(--text-secondary)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default PaginationControl;
