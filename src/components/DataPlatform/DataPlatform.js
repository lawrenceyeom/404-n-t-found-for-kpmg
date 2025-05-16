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
import './DataPlatform.css';

const DataPlatform = () => {
  const [activeTab, setActiveTab] = useState('dashboard');  // 默认显示仪表盘
  const [dataSources, setDataSources] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);
  const [ingestionStats, setIngestionStats] = useState([]);
  const [featureMetrics, setFeatureMetrics] = useState([]);
  const [models, setModels] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [modelHealth, setModelHealth] = useState([]);

  useEffect(() => {
    // 获取数据源列表
    fetch(`${API_BASE}/platform/data-sources`)
      .then(res => res.json())
      .then(data => setDataSources(data))
      .catch(err => console.error('Error fetching data sources:', err));
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <DashboardCards />;
      case 'data-sources':
        return <DataSourceList dataSources={dataSources} />;
      case 'data-quality':
        return <DataQualityMatrix dataQuality={dataQuality} />;
      case 'ingestion':
        return <IngestionStats ingestionStats={ingestionStats} />;
      case 'features':
        return <FeatureEngineering featureMetrics={featureMetrics} />;
      case 'models':
        return <ModelsList models={models} />;
      case 'model-perf':
        return <ModelPerformance performance={modelPerformance} />;
      case 'model-health':
        return <ModelHealthMonitor modelHealth={modelHealth} />;
      default:
        return <DashboardCards />;
    }
  };

  return (
    <div className="data-platform-container">
      <div className="data-platform-header">
        <h1>数据平台</h1>
        <p>集成数据源、模型与指标监控</p>
      </div>

      <div className="data-platform-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          总览仪表盘
        </button>
        <button 
          className={activeTab === 'data-sources' ? 'active' : ''}
          onClick={() => setActiveTab('data-sources')}
        >
          数据源
        </button>
        <button 
          className={activeTab === 'data-quality' ? 'active' : ''}
          onClick={() => setActiveTab('data-quality')}
        >
          数据质量
        </button>
        <button 
          className={activeTab === 'ingestion' ? 'active' : ''}
          onClick={() => setActiveTab('ingestion')}
        >
          数据摄入
        </button>
        <button 
          className={activeTab === 'features' ? 'active' : ''}
          onClick={() => setActiveTab('features')}
        >
          特征工程
        </button>
        <button 
          className={activeTab === 'models' ? 'active' : ''}
          onClick={() => setActiveTab('models')}
        >
          模型管理
        </button>
        <button 
          className={activeTab === 'model-perf' ? 'active' : ''}
          onClick={() => setActiveTab('model-perf')}
        >
          模型性能
        </button>
        <button 
          className={activeTab === 'model-health' ? 'active' : ''}
          onClick={() => setActiveTab('model-health')}
        >
          模型健康
        </button>
      </div>

      <div className="data-platform-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default DataPlatform; 