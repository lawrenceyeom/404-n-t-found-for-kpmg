import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import DataSourceList from './DataSourceList';
import DataQualityMatrix from './DataQualityMatrix';
import IngestionStats from './IngestionStats';
import FeatureEngineering from './FeatureEngineering';
import ModelsList from './ModelsList';
import ModelPerformance from './ModelPerformance';
import ModelHealthMonitor from './ModelHealthMonitor';
import DashboardCards from './DashboardCards';
import { Routes, Route, useLocation, Navigate, NavLink } from 'react-router-dom';
import './DataPlatform.css';

const TABS = [
  { key: 'dashboard', label: '可视化仪表盘' },
  { key: 'data-sources', label: '数据源管理' },
  { key: 'data-quality', label: '数据质量' },
  { key: 'ingestion', label: '数据摄入统计' },
  { key: 'features', label: '特征工程' },
  { key: 'models', label: '模型管理' },
  { key: 'model-perf', label: '模型性能' },
  { key: 'model-health', label: '模型健康度' },
];

const DataPlatform = () => {
  const location = useLocation();
  const [dataSources, setDataSources] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);
  const [ingestionStats, setIngestionStats] = useState([]);
  const [featureMetrics, setFeatureMetrics] = useState([]);
  const [models, setModels] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [modelHealth, setModelHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialTab, setInitialTab] = useState('');

  // 在组件挂载时检查当前路径，并设置初始标签
  useEffect(() => {
    const path = location.pathname;
    // 从路径中提取当前标签
    const tabFromPath = path.split('/').pop();
    if (tabFromPath) {
      setInitialTab(tabFromPath);
      // 将当前路径保存到localStorage，保证刷新时能够恢复状态
      localStorage.setItem('lastVisitedPath', path);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchDataSourcesData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/data-sources`);
        const data = await response.json();
        setDataSources(data);
      } catch (error) {
        console.error('Error fetching data sources:', error);
      }
    };

    const fetchDataQualityData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/data-quality-metrics`);
        const data = await response.json();
        setDataQuality(data);
      } catch (error) {
        console.error('Error fetching data quality:', error);
      }
    };

    const fetchIngestionData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/data-ingestion-stats`);
        const data = await response.json();
        setIngestionStats(data);
      } catch (error) {
        console.error('Error fetching ingestion stats:', error);
      }
    };

    const fetchFeatureEngineeringData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/feature-engineering-metrics`);
        const data = await response.json();
        setFeatureMetrics(data);
      } catch (error) {
        console.error('Error fetching feature metrics:', error);
      }
    };

    const fetchModelsData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/models`);
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };

    const fetchModelPerformanceData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/model-performance`);
        const data = await response.json();
        setModelPerformance(data);
      } catch (error) {
        console.error('Error fetching model performance:', error);
      }
    };

    const fetchModelHealthData = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/model-health`);
        const data = await response.json();
        setModelHealth(data);
      } catch (error) {
        console.error('Error fetching model health:', error);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDataSourcesData(),
        fetchDataQualityData(),
        fetchIngestionData(),
        fetchFeatureEngineeringData(),
        fetchModelsData(),
        fetchModelPerformanceData(),
        fetchModelHealthData()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // 监听选项卡变化，保存到localStorage
  const handleTabChange = (tabKey) => {
    localStorage.setItem('lastVisitedPath', `/data-platform/${tabKey}`);
  };

  return (
    <div className="data-platform-container" style={{ paddingTop: 90 }}>
      <h2 className="platform-title" style={{ marginTop: 16 }}>AURA 数智中台</h2>
      <p className="platform-subtitle">多源数据融合与AI模型管理平台</p>
      {/* 页面下方选项卡 */}
      <div className="platform-tabs" style={{ display: 'flex', gap: 8, margin: '18px 0 24px 0', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <NavLink
            key={tab.key}
            to={`/data-platform/${tab.key}`}
            onClick={() => handleTabChange(tab.key)}
            style={({ isActive }) => ({
              background: isActive ? '#4be1a0' : 'rgba(34,51,102,0.85)',
              color: isActive ? '#15294e' : '#b3cfff',
              fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 7, padding: '5px 14px', cursor: 'pointer',
              boxShadow: isActive ? '0 2px 8px #4be1a055' : 'none',
              transition: 'all 0.18s', letterSpacing: 1, textDecoration: 'none',
              outline: 'none', minWidth: 0, minHeight: 0, lineHeight: 1.2
            })}
          >{tab.label}</NavLink>
        ))}
      </div>
      <div className="platform-content">
        <Routes>
          <Route path="dashboard" element={<DashboardCards />} />
          <Route path="data-sources" element={<DataSourceList dataSources={dataSources} />} />
          <Route path="data-quality" element={<DataQualityMatrix dataQuality={dataQuality} />} />
          <Route path="ingestion" element={<IngestionStats ingestionStats={ingestionStats} />} />
          <Route path="features" element={<FeatureEngineering featureMetrics={featureMetrics} />} />
          <Route path="models" element={<ModelsList models={models} />} />
          <Route path="model-perf" element={<ModelPerformance modelPerformance={modelPerformance} />} />
          <Route path="model-health" element={<ModelHealthMonitor modelHealth={modelHealth} />} />
          <Route path="*" element={
            // 如果有初始标签，则导航到该标签，否则默认为仪表盘
            initialTab && TABS.some(tab => tab.key === initialTab) 
              ? <Navigate to={initialTab} replace /> 
              : <Navigate to="dashboard" replace />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default DataPlatform; 