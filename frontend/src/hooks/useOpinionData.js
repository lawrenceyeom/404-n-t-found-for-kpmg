import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '../constants';

export const useOpinionData = (company) => {
  const [opinionList, setOpinionList] = useState([]);
  const [opinionIdx, setOpinionIdx] = useState(0);
  const [opinionTrend, setOpinionTrend] = useState({ trend: [], keywords: [], platform_stat: [], hot_events: [] });
  const [opinionLoading, setOpinionLoading] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (!company) return;
    fetch(`${API_BASE}/fake/opinion_raw?company=${company}&days=7&per_day=10`)
      .then(res => res.json())
      .then(data => {
        setOpinionList(data.opinion_raw || []);
        setOpinionIdx(0);
      })
      .catch(error => console.error("Failed to fetch opinion raw data:", error));
  }, [company]);

  useEffect(() => {
    if (opinionList.length === 0) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setOpinionIdx(idx => (idx + 1) % opinionList.length);
    }, 2500);
    return () => clearInterval(intervalRef.current);
  }, [opinionList]);

  useEffect(() => {
    if (!company) return;
    setOpinionLoading(true);
    fetch(`${API_BASE}/fake/opinion_trend?company=${company}&days=7&per_day=20`)
      .then(res => res.json())
      .then(data => {
        setOpinionTrend(data || { trend: [], keywords: [], platform_stat: [], hot_events: [] });
      })
      .catch(error => console.error("Failed to fetch opinion trend:", error))
      .finally(() => setOpinionLoading(false));
  }, [company]);

  return { opinionList, opinionIdx, opinionTrend, opinionLoading };
}; 