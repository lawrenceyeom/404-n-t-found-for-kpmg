import { useEffect, useState } from 'react';

export function useDataUpdateHighlight(data, duration = 2000) {
  const [highlight, setHighlight] = useState(false);
  useEffect(() => {
    setHighlight(true);
    const timer = setTimeout(() => setHighlight(false), duration);
    return () => clearTimeout(timer);
  }, [JSON.stringify(data)]);
  return highlight;
} 