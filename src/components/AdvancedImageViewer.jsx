import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import './AdvancedImageViewer.css';

const AdvancedImageViewer = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Lightbox Pan & Zoom State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    resetZoom();
  };

  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  };

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
    resetZoom();
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    resetZoom();
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  const overlayRef = useRef(null);

  useEffect(() => {
    const handleNativeWheel = (e) => {
      e.preventDefault(); // Prevents the whole page from scrolling
      const scaleAdjust = e.deltaY * -0.002;
      setScale((prev) => {
        const newScale = Math.min(Math.max(1, prev + scaleAdjust), 5);
        if (newScale === 1) setPosition({ x: 0, y: 0 });
        return newScale;
      });
    };

    const overlayEl = overlayRef.current;
    if (overlayEl) {
      overlayEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    }
    
    return () => {
      if (overlayEl) {
        overlayEl.removeEventListener('wheel', handleNativeWheel);
      }
    };
  }, [isLightboxOpen]);

  const handlePointerDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLightboxOpen]);

  if (!images || images.length === 0) return null;

  return (
    <div className="aiv-container">
      <div className="aiv-header">
        <h4>{title}</h4>
        <span className="aiv-badge">{images.length} foto</span>
      </div>

      {/* Inline Carousel */}
      <div className="aiv-carousel" onClick={() => openLightbox(currentIndex)}>
        <img src={images[currentIndex].url} alt={images[currentIndex].label} className="aiv-main-img" />
        
        <div className="aiv-overlay-label">
          {images[currentIndex].label}
        </div>

        {images.length > 1 && (
          <>
            <button className="aiv-nav-btn aiv-prev" onClick={prevImage}><ChevronLeft size={24} /></button>
            <button className="aiv-nav-btn aiv-next" onClick={nextImage}><ChevronRight size={24} /></button>
            
            <div className="aiv-dots">
              {images.map((_, idx) => (
                <div key={idx} className={`aiv-dot ${idx === currentIndex ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} />
              ))}
            </div>
          </>
        )}
        
        <div className="aiv-expand-hint">
          <Maximize2 size={20} />
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && createPortal(
        <div className="aiv-lightbox-overlay" ref={overlayRef}>
          <div className="aiv-lightbox-header">
            <div className="aiv-lightbox-info">
              <h3>{title}</h3>
              <p>{images[currentIndex].label} ({currentIndex + 1} / {images.length})</p>
            </div>
            <div className="aiv-lightbox-controls">
              <button onClick={handleZoomOut} disabled={scale === 1}><ZoomOut size={20} /></button>
              <button onClick={resetZoom} disabled={scale === 1} style={{ fontSize: '14px', fontWeight: 'bold' }}>{Math.round(scale * 100)}%</button>
              <button onClick={handleZoomIn} disabled={scale === 5}><ZoomIn size={20} /></button>
              <div className="aiv-divider"></div>
              <button onClick={closeLightbox} className="aiv-close-btn"><X size={24} /></button>
            </div>
          </div>

          <div 
            className={`aiv-lightbox-body ${scale > 1 ? 'is-zoomed' : ''} ${isDragging ? 'is-dragging' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img 
              src={images[currentIndex].url} 
              alt={images[currentIndex].label} 
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
              draggable={false}
            />
          </div>

          {images.length > 1 && (
            <>
              <button className="aiv-lb-nav aiv-lb-prev" onClick={(e) => prevImage(e)}><ChevronLeft size={36} /></button>
              <button className="aiv-lb-nav aiv-lb-next" onClick={(e) => nextImage(e)}><ChevronRight size={36} /></button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdvancedImageViewer;
