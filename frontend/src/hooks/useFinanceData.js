/**
 * Financial Data Hook for AURA Platform
 * 
 * This custom React hook manages the retrieval and state management of financial data
 * for the AURA platform. It fetches multiple financial statement types from the backend API
 * and makes them available to the application components.
 * 
 * Data fetched:
 * - Balance Sheet (BS): Asset/liability structure and equity composition
 * - Income Statement (IS): Revenue, expenses, and profit metrics
 * - Cash Flow Statement (CF): Operating, investing, and financing cash flows
 * - Financial Ratios: Key performance indicators and financial health metrics
 * 
 * Features:
 * - Automatic data fetching when company selection changes
 * - Period selection for time-series data analysis
 * - Loading state management for each data type
 * - Error handling and data validation
 * - Consistent data structure for application components
 * 
 * @param {string} company - The company identifier to fetch data for (e.g., 'aura', 'beta', 'crisis')
 * @param {string[]} requestedPeriodsArray - Optional array of periods to request (e.g., ['2022', '2023'])
 * @returns {Object} - Object containing financial data and loading states
 */

import { useState, useEffect } from 'react';
import { API_BASE, DEFAULT_TREND_PERIODS } from '../constants'; // Ensure constants are correctly defined

export const useFinanceData = (company, requestedPeriodsArray = DEFAULT_TREND_PERIODS) => {
  const [balanceSheetData, setBalanceSheetData] = useState([]);
  const [incomeStatementData, setIncomeStatementData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]); // Added for completeness
  const [financialRatiosData, setFinancialRatiosData] = useState({}); // For financial ratios

  const [bsLoading, setBsLoading] = useState(false);
  const [isISLoading, setIsISLoading] = useState(false); // Renamed to avoid conflict
  const [isCFLoading, setIsCFLoading] = useState(false); // Renamed
  const [isRatiosLoading, setIsRatiosLoading] = useState(false); // Renamed

  // Prepare periods query string, ensure requestedPeriodsArray is an array
  const periodsQueryParam = (Array.isArray(requestedPeriodsArray) && requestedPeriodsArray.length > 0)
    ? requestedPeriodsArray.join(',')
    : '';

  // Fetch Balance Sheet
  useEffect(() => {
    if (!company) return;
    setBsLoading(true);
    let url = `${API_BASE}/finance_data?sheet=合并-bs&company=${company}`;
    if (periodsQueryParam) {
      url += `&request_periods=${periodsQueryParam}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (response && Array.isArray(response.data)) {
          setBalanceSheetData(response.data);
        } else {
          setBalanceSheetData([]);
          console.error('Unexpected Balance Sheet data format:', response);
        }
      })
      .catch(err => {
        console.error('Error fetching Balance Sheet data:', err);
        setBalanceSheetData([]);
      })
      .finally(() => setBsLoading(false));
  }, [company, periodsQueryParam]); // Depend on the generated string

  // Fetch Income Statement
  useEffect(() => {
    if (!company) return;
    setIsISLoading(true);
    let url = `${API_BASE}/finance_data?sheet=合并-is&company=${company}`;
    if (periodsQueryParam) {
      url += `&request_periods=${periodsQueryParam}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (response && Array.isArray(response.data)) {
          setIncomeStatementData(response.data);
        } else {
          setIncomeStatementData([]);
          console.error('Unexpected Income Statement data format:', response);
        }
      })
      .catch(err => {
        console.error('Error fetching Income Statement data:', err);
        setIncomeStatementData([]);
      })
      .finally(() => setIsISLoading(false));
  }, [company, periodsQueryParam]);

  // Fetch Cash Flow Statement
  useEffect(() => {
    if (!company) return;
    setIsCFLoading(true);
    let url = `${API_BASE}/finance_data?sheet=合并-cf&company=${company}`;
    if (periodsQueryParam) {
      url += `&request_periods=${periodsQueryParam}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (response && Array.isArray(response.data)) {
          setCashFlowData(response.data);
        } else {
          setCashFlowData([]);
          console.error('Unexpected Cash Flow data format:', response);
        }
      })
      .catch(err => {
        console.error('Error fetching Cash Flow data:', err);
        setCashFlowData([]);
      })
      .finally(() => setIsCFLoading(false));
  }, [company, periodsQueryParam]);

  // Fetch Financial Ratios
  useEffect(() => {
    if (!company) return;
    setIsRatiosLoading(true);
    let url = `${API_BASE}/finance_data?sheet=financial_ratios&company=${company}`;
    if (periodsQueryParam) {
      url += `&request_periods=${periodsQueryParam}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(response => {
        if (response && response.data && typeof response.data === 'object') {
          setFinancialRatiosData(response.data);
        } else {
          setFinancialRatiosData({});
          console.error('Unexpected financial ratios data format:', response);
        }
      })
      .catch(err => {
        console.error('Error fetching financial ratios:', err);
        setFinancialRatiosData({});
      })
      .finally(() => setIsRatiosLoading(false));
  }, [company, periodsQueryParam]);

  // Calculate trendLoading - any of the data sources loading means trend data is loading
  const trendLoading = bsLoading || isISLoading || isCFLoading || isRatiosLoading;

  // Return using the old variable names to maintain compatibility with App.js
  return {
    financeData: balanceSheetData,           // App.js expects this as financeData
    financeISData: incomeStatementData,      // App.js expects this as financeISData
    cashFlowData,                           // New, might not be used in App.js yet
    trendData: financialRatiosData,          // App.js expects this as trendData for ratios
    
    trendLoading,                            // Combined loading state for all data
    bsLoading,
    isISLoading,
    isCFLoading,
    isRatiosLoading,
    
    requestedPeriods: requestedPeriodsArray, // Pass down the original array if needed
  };
};