// src/App.js
import React, { useState, useCallback } from 'react';
import './App.css';

// Constants (Import only what App.js directly needs for props or top-level decisions)
import {
  API_BASE, // Assuming hooks might still need this if not configured internally or via context
  COMPANIES,
  RISK_DIMENSIONS,
  ASSET_ITEMS, // Used by AssetStructurePieChart (passed as prop or AssetStructurePieChart imports it)
  DEFAULT_TREND_PERIODS,
  ALL_RATIOS_CONFIG, // Used by HistoricalTrendAnalysis
  INITIAL_SELECTED_RATIOS, // Used by HistoricalTrendAnalysis
  INITIAL_TREND_METRIC_KEYS_MAIN, // Used by HistoricalTrendAnalysis
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
// Note: DrilldownModal is assumed to be internal to HistoricalTrendAnalysis

function App() {
  const [company, setCompany] = useState('aura'); // Top-level state

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

  // Feedback form state (can be further moved into FeedbackModal if it handles its own state)
  const [feedbackType, setFeedbackType] = useState('功能建议');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackContact, setFeedbackContact] = useState('');

  // 使用 useCallback 包装 onOpenRadarDetail
  const handleOpenRadarDetail = useCallback((dimIdx) => {
    if (riskScores && riskScores[dimIdx] !== undefined) {
      setRadarModalData({ dimIdx, score: riskScores[dimIdx] });
    } else {
      console.warn('Cannot open radar detail: riskScores or specific dimension score is undefined.');
      setRadarModalData(null);
    }
  }, [riskScores]);

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

  return (
    <div className="App" style={{ background: 'linear-gradient(135deg, #0a1f44 60%, #102b6a 100%)', minHeight: '100vh', color: '#eaf6ff' }}>
      <Header
        currentCompanyId={company} // Pass company ID
        onSetCompany={setCompany}
        companiesData={COMPANIES} // Pass company data for rendering buttons
      />

      <main style={{
        width: '96vw',
        maxWidth: 1600,
        minWidth: 320, // Ensure responsiveness
        margin: '0 auto', // Centering
        padding: '2vw',
        paddingTop: 'calc(2vw + 80px)', // Adjusted for fixed header (approx. 80px height of header)
        background: 'rgba(22,36,71,0.92)',
        borderRadius: 20,
        boxShadow: '0 6px 32px #00152944',
        border: '1.5px solid #223366',
        transition: 'width 0.3s',
        // overflow: 'hidden', // Be cautious with this if modals are not portalized
      }}>
        <CompanyInfoSection
          companyId={company}
          companiesData={COMPANIES}
        />

        <HistoricalTrendAnalysis
          company={company}
          trendData={trendData}
          financeISData={financeISData}
          trendPeriods={DEFAULT_TREND_PERIODS}
          isLoading={trendLoading}
          allRatiosConfig={ALL_RATIOS_CONFIG}
          initialSelectedRatios={INITIAL_SELECTED_RATIOS}
          initialTrendMetricKeysMain={INITIAL_TREND_METRIC_KEYS_MAIN}
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
        />

        <div style={{ marginTop: 36, width: '100%', display: 'flex', gap: 40, flexWrap: 'wrap', minHeight: '450px' }}>
          <AssetStructurePieChart
            financeData={financeData}
            assetItems={ASSET_ITEMS} // Asset items definition
          />
          <BusinessRiskHeatmap
            company={company}
            bizModules={bizModules}
            riskDimensions={RISK_DIMENSIONS}
          />
        </div>
      </main>

      {/* Modals rendered at the App level */}
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
          alertDetailData={alertDetailData} // Data for the detail view
          onOpenDetail={openAlertDetail}     // Function to trigger detail view/fetch
          onCloseDetail={closeAlertDetail}   // Function to close detail view
          riskDimensions={RISK_DIMENSIONS}
          apiBase={API_BASE} // If modal fetches detail internally
        />
      )}

      {radarModalData && (
        <RadarDetailModal
          isOpen={!!radarModalData}
          onClose={() => setRadarModalData(null)}
          modalData={radarModalData} // Contains { dimIdx, score }
          riskDimensions={RISK_DIMENSIONS}
          riskDimExplain={RISK_DIM_EXPLAIN}
          riskDimKeys={RISK_DIM_KEYS}
        />
      )}

      {feedbackSuccess && (
        <div style={{
          position: 'fixed', top: '12%', left: '50%', transform: 'translateX(-50%)', // Better centering
          width: 'auto', // Fit content
          zIndex: 10000, // Ensure it's above other elements
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
  );
}

export default App;