import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

const DebouncedSearchInput = ({ 
  value, 
  onChange, 
  delay = 300, 
  placeholder = "Cari...", 
  className = "", 
  style = {} 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  // Sync local value if external value changes (e.g. cleared)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal); // Instant update for the input field (no lag)

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(newVal); // Notify parent after delay, triggering the heavy re-render
    }, delay);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Search 
        size={16} 
        style={{ 
          position: 'absolute', 
          left: '1rem', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          color: 'var(--text-secondary)' 
        }} 
      />
      <input 
        type="text" 
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className={className}
        style={style}
      />
    </div>
  );
};

export default DebouncedSearchInput;
