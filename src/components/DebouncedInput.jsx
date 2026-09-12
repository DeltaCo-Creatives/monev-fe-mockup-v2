import React, { useState, useEffect, useRef } from 'react';

const DebouncedInput = ({ 
  value, 
  onChange, 
  delay = 300, 
  ...rest 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef(null);

  // Sync local value if external value changes (e.g. data loaded from API)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setLocalValue(newVal); // Instant update for the input field (buttery smooth 60fps)

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
    <input 
      value={localValue}
      onChange={handleChange}
      {...rest}
    />
  );
};

export default DebouncedInput;
