/**
 * Main Application Component for AURA Platform Frontend
 * 
 * This is the root component of the AURA (Auditing Universal Risk Analytics) platform frontend.
 * It orchestrates the overall UI layout, state management, and routing for the application,
 * bringing together various dashboard components to create a comprehensive risk monitoring
 * interface for auditors.
 * 
 * Key components:
 * - Header: Navigation and company selection
 * - Main Dashboard: Risk visualization, financial trends, and alert display
 * - Data Platform: Technical platform management interface
 * - Modal system: For detailed information and user feedback
 * 
 * Main features:
 * - Company selection and data context management
 * - Historical trend analysis of financial metrics
 * - Risk score visualization across multiple dimensions
 * - Asset structure visualization
 * - Business risk heatmap
 * - Alert notifications and history
 * - Opinion and sentiment monitoring
 * - Interactive feedback collection
 * 
 * The component uses several custom hooks to manage different data streams:
 * - useOpinionData: Manages sentiment and news opinion data
 * - useFinanceData: Handles financial statement information
 * - useCompanyData: Calculates risk scores and business module analysis
 * - useAlerts: Manages alert notifications and history
 */

// src/App.js
import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import DataPlatform from './components/DataPlatform/DataPlatform';
import DataLake from './components/DataLake/DataLake';

// Constants (Import only what App.js directly needs for props or top-level decisions)
import {
  API_BASE, // Assuming hooks might still need this if not configured internally or via context
  COMPANIES,
  RISK_DIMENSIONS,
  ASSET_ITEMS, // Used by AssetStructurePieChart (passed as prop or AssetStructurePieChart imports it)
  DEFAULT_TREND_PERIODS,
  ALL_RATIOS_CONFIG, // Used by HistoricalTrendAnalysis
  INITIAL_SELECTED_RATIOS, // Used by HistoricalTrendAnalysis
  INITIAL_MAIN_ITEMS, // Used by HistoricalTrendAnalysis
  RISK_DIM_EXPLAIN, // Used by RadarDetailModal
  RISK_DIM_KEYS,   // Used by RadarDetailModal
} from './constants'; // Adjust path as needed

// Custom Hooks
import { useOpinionData } from './hooks/useOpinionData';
import { useFinanceData } from './hooks/useFinanceData';
import { useCompanyData } from './hooks/useCompanyData';
import useAlerts from './hooks/useAlerts';

// Utility functions that might be passed to hooks if not directly imported by them
import { getWeatherByRisk, getBaseRiskScores, findRow } from './utils/helpers'; // findRow might be used by HistoricalTrendAnalysis directly
import { calculateRatios } from './utils/chartUtils'; // calculateRatios is likely used by HistoricalTrendAnalysis

// Main Components
import Header from './components/Header';
import CompanyInfoSection from './components/CompanyInfoSection';
import HistoricalTrendAnalysis from './components/HistoricalTrendAnalysis/HistoricalTrendAnalysis';
import DashboardGrid from './components/DashboardGrid/DashboardGrid';
import AssetStructurePieChart from './components/AssetStructurePieChart';
import BusinessRiskHeatmap from './components/BusinessRiskHeatmap';

// Modal Components
import FeedbackModal from './components/modals/FeedbackModal';
import AlertHistoryModal from './components/modals/AlertHistoryModal';
import RadarDetailModal from './components/modals/RadarDetailModal';
import WeatherForecastModal from './components/modals/WeatherForecastModal';
// Note: DrilldownModal is assumed to be internal to HistoricalTrendAnalysis

function App() {
  const [company, setCompany] = useState('aura'); // Top-level state
  const [lakeType, setLakeType] = useState('AURA稳健'); // 数据湖公司类型
  const [lastVisitedPath, setLastVisitedPath] = useState('');

  // --- Instantiate Custom Hooks ---
  const { opinionList, opinionIdx, opinionLoading } = useOpinionData(company, API_BASE);
  const { financeData, financeISData, trendData, trendLoading } = useFinanceData(company, DEFAULT_TREND_PERIODS);
  const { riskScores, bizModules, weather } = useCompanyData(company, opinionList, opinionLoading, RISK_DIMENSIONS, getWeatherByRisk, getBaseRiskScores);
  const {
    currentAlerts,
    currentAlertIdx,
    alertHistory,
    isAlertHistoryOpen,
    openAlertHistoryModal,
    closeAlertHistoryModal,
    alertDetailData,
    openAlertDetail,
    closeAlertDetail,
  } = useAlerts(riskScores, API_BASE, company, RISK_DIMENSIONS);

  // --- Top-level Modal States & Handlers ---
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [radarModalData, setRadarModalData] = useState(null); // { dimIdx, score }
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [weatherAnalysisData, setWeatherAnalysisData] = useState(null);

  // Feedback form state (can be further moved into FeedbackModal if it handles its own state)
  const [feedbackType, setFeedbackType] = useState('功能建议');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');

  // 记住用户最后访问的路径
  useEffect(() => {
    // 从localStorage获取上次访问的路径
    const savedPath = localStorage.getItem('lastVisitedPath');
    if (savedPath) {
      setLastVisitedPath(savedPath);
    }

    // 监听路径变化并保存
    const handlePathChange = () => {
      const currentPath = window.location.pathname;
      localStorage.setItem('lastVisitedPath', currentPath);
      setLastVisitedPath(currentPath);
    };

    window.addEventListener('beforeunload', handlePathChange);
    return () => {
      window.removeEventListener('beforeunload', handlePathChange);
    };
  }, []);

  // 使用 useCallback 包装 onOpenRadarDetail
  const handleOpenRadarDetail = useCallback((dimIdx) => {
    if (riskScores && riskScores[dimIdx] !== undefined) {
      setRadarModalData({ dimIdx, score: riskScores[dimIdx] });
    } else {
      console.warn('Cannot open radar detail: riskScores or specific dimension score is undefined.');
      setRadarModalData(null);
    }
  }, [riskScores]);
  
  // 处理打开气象预报详情
  const handleOpenWeatherForecast = useCallback(() => {
    setIsWeatherModalOpen(true);
    
    // 获取对应公司的财务分析数据
    const fetchAnalysisData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/datalake?company=${company}&data_type=finance&layer=analysis`);
        if (response.ok) {
          const data = await response.json();
          setWeatherAnalysisData(data);
        } else {
          console.error('Failed to fetch finance analysis data');
          setWeatherAnalysisData(null);
        }
      } catch (error) {
        console.error('Error fetching finance analysis data:', error);
        setWeatherAnalysisData(null);
      }
    };
    
    fetchAnalysisData();
  }, [company, API_BASE]);

  const handleFeedbackSubmit = () => {
    // In a real app, you'd likely call an API here
    console.log("Feedback submitted:", { company, feedbackType, feedbackContent, feedbackContact });
    setIsFeedbackModalOpen(false);
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 2500); // Increased duration for visibility
    // Reset form fields
    setFeedbackContent('');
    setFeedbackContact('');
    setFeedbackType('功能建议'); // Reset to default
  };

  console.log('trendData', trendData, 'financeISData', financeISData, 'trendLoading', trendLoading);

  // 检查当前路径是否包含data-platform/data-quality
  const shouldRedirectToDataQuality = lastVisitedPath && lastVisitedPath.includes('/data-platform/data-quality');

  // 渲染主仪表板内容
  const renderMainDashboard = () => (
      <main style={{
        width: '96vw',
        maxWidth: 1600,
              minWidth: 320,
              margin: '0 auto',
        padding: '2vw',
              paddingTop: 110,
        background: 'rgba(22,36,71,0.92)',
        borderRadius: 20,
        boxShadow: '0 6px 32px #00152944',
        border: '1.5px solid #223366',
        transition: 'width 0.3s',
      }}>
              <CompanyInfoSection companyId={company} companiesData={COMPANIES} />
        <HistoricalTrendAnalysis
          company={company}
          trendData={trendData}
          financeISData={financeISData}
          financeData={financeData}
          trendPeriods={DEFAULT_TREND_PERIODS}
          isLoading={trendLoading}
          allRatiosConfig={ALL_RATIOS_CONFIG}
          initialSelectedRatios={INITIAL_SELECTED_RATIOS}
          initialMainItems={INITIAL_MAIN_ITEMS}
        />
        <DashboardGrid
          opinionList={opinionList}
          opinionIdx={opinionIdx}
          currentAlerts={currentAlerts}
          currentAlertIdx={currentAlertIdx}
          riskScores={riskScores}
          riskDimensions={RISK_DIMENSIONS}
          weather={weather}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenAlertHistory={openAlertHistoryModal}
          onOpenRadarDetail={handleOpenRadarDetail}
          onOpenWeatherForecast={handleOpenWeatherForecast}
        />
        <div style={{ marginTop: 36, width: '100%', display: 'flex', gap: 40, flexWrap: 'wrap', minHeight: '450px' }}>
                <AssetStructurePieChart financeData={financeData} assetItems={ASSET_ITEMS} />
                <BusinessRiskHeatmap company={company} bizModules={bizModules} riskDimensions={RISK_DIMENSIONS} />
        </div>
        <div style={{
          width: '100%',
          textAlign: 'center',
          marginTop: 20,
          paddingTop: 12,
          paddingBottom: 8,
          borderTop: '1px solid rgba(64, 169, 255, 0.2)',
          color: 'rgba(179, 207, 255, 0.6)',
          fontSize: 13,
          fontWeight: 400,
        }}>
          本demo由404 N'T FOUND（谢李晗、顾佳文、翁翊珊、姚人杰）开发，仅供展示预览，不代表最终品质
        </div>
      </main>
  );

  return (
    <Router>
      <div className="App" style={{ background: 'linear-gradient(135deg, #0a1f44 60%, #102b6a 100%)', minHeight: '100vh', color: '#eaf6ff' }}>
        <Header
          currentCompanyId={company}
          onSetCompany={setCompany}
          companiesData={COMPANIES}
          lakeType={lakeType}
          setLakeType={setLakeType}
        />
        <Routes>
          <Route path="/" element={renderMainDashboard()} />
          <Route path="/data-platform/*" element={<DataPlatform />} />
          <Route path="/data-platform" element={
            shouldRedirectToDataQuality ? 
            <Navigate to="/data-platform/data-quality" replace /> :
            <Navigate to="/data-platform/dashboard" replace />
          } />
          <Route path="/datalake" element={<DataLake lakeType={lakeType} />} />
        </Routes>
      {isFeedbackModalOpen && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          feedbackType={feedbackType}
          setFeedbackType={setFeedbackType}
          feedbackContent={feedbackContent}
          setFeedbackContent={setFeedbackContent}
          feedbackContact={feedbackContact}
          setFeedbackContact={setFeedbackContact}
          onSubmit={handleFeedbackSubmit}
        />
      )}
      {isAlertHistoryOpen && (
        <AlertHistoryModal
          isOpen={isAlertHistoryOpen}
          onClose={closeAlertHistoryModal}
          history={alertHistory}
            alertDetailData={alertDetailData}
            onOpenDetail={openAlertDetail}
            onCloseDetail={closeAlertDetail}
          riskDimensions={RISK_DIMENSIONS}
            apiBase={API_BASE}
        />
      )}
      {isWeatherModalOpen && (
        <WeatherForecastModal
          isOpen={isWeatherModalOpen}
          onClose={() => setIsWeatherModalOpen(false)}
          weather={weather}
          company={company}
          analysisData={weatherAnalysisData}
        />
      )}
      
      {radarModalData && (
        <RadarDetailModal
          isOpen={!!radarModalData}
          onClose={() => setRadarModalData(null)}
            modalData={radarModalData}
          riskDimensions={RISK_DIMENSIONS}
          riskDimExplain={RISK_DIM_EXPLAIN}
          riskDimKeys={RISK_DIM_KEYS}
        />
      )}
      {feedbackSuccess && (
        <div style={{
            position: 'fixed', top: '12%', left: '50%', transform: 'translateX(-50%)',
            width: 'auto', zIndex: 10000,
        }}>
          <div style={{
            background: '#223366', color: '#4be1a0', fontWeight: 800,
            fontSize: 18, borderRadius: 10, padding: '16px 38px',
            boxShadow: '0 2px 16px #40a9ff55', border: '2px solid #4be1a0',
            textAlign: 'center',
          }}>
            反馈提交成功，感谢您的参与！
          </div>
        </div>
      )}
    </div>
    </Router>
  );
}

export default App;