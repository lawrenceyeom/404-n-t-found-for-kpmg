import { useState, useEffect } from 'react';
import { API_BASE, DEFAULT_TREND_PERIODS } from '../constants';

export const useFinanceData = (company, trendPeriods = DEFAULT_TREND_PERIODS) => {
  const [financeData, setFinanceData] = useState([]);
  const [financeISData, setFinanceISData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  // 拉取资产负债表
  useEffect(() => {
    if (!company) return;
    fetch(`${API_BASE}/finance/table?sheet=合并-bs&company=${company}`)
      .then(res => res.json())
      .then(data => {
        console.log('bs data:', data);
        setFinanceData(Array.isArray(data.data) ? data.data : []);
      });
  }, [company]);

  // 拉取利润表
  useEffect(() => {
    if (!company) return;
    fetch(`${API_BASE}/finance/table?sheet=合并-is&company=${company}`)
      .then(res => res.json())
      .then(data => {
        console.log('is data:', data);
        setFinanceISData(Array.isArray(data.data) ? data.data : []);
      });
  }, [company]);

  // 拉取趋势数据
  useEffect(() => {
    if (!company || !trendPeriods) return;
    setTrendLoading(true);
    fetch(`${API_BASE}/finance/table?sheet=合并-bs&company=${company}&periods=${trendPeriods.join(',')}`)
      .then(res => res.json())
      .then(data => {
        console.log('trend data:', data);
        setTrendData(Array.isArray(data.data) ? data.data : []);
        setTrendLoading(false);
      })
      .catch(err => {
        setTrendLoading(false);
        console.error('trend fetch error', err);
      });
  }, [company, trendPeriods]);

  return {
    financeData,
    financeISData,
    trendData,
    trendPeriods,
    trendLoading,
  };
}; 