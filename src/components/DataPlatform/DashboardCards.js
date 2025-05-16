import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import './DataPlatform.css';

// 导入卡片组件
import ModelHealthCard from './cards/ModelHealthCard';
//import DataQualityCard from './cards/DataQualityCard';
//import FeatureImportanceCard from './cards/FeatureImportanceCard';
//import DataIngestionCard from './cards/DataIngestionCard';
//import ModelPerformanceCard from './cards/ModelPerformanceCard';

const DashboardCards = () => {
  // 状态管理
  const [modelHealth, setModelHealth] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [ingestionStats, setIngestionStats] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  // 数据加载
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行获取所有需要的数据
        const [
          healthRes,
          qualityRes,
          featuresRes,
          ingestionRes,
          performanceRes
        ] = await Promise.all([
          fetch(`${API_BASE}/platform/model-health`),
          fetch(`${API_BASE}/platform/data-quality-metrics`),
          fetch(`${API_BASE}/platform/feature-importance/risk_pred_001`),
          fetch(`${API_BASE}/platform/data-ingestion-stats`),
          fetch(`${API_BASE}/platform/model-performance`)
        ]);

        // 解析JSON响应
        const health = await healthRes.json();
        const quality = await qualityRes.json();
        const features = await featuresRes.json();
        const ingestion = await ingestionRes.json();
        const performance = await performanceRes.json();

        // 更新状态
        setModelHealth(health);
        setDataQuality(quality);
        setFeatureImportance(features);
        setIngestionStats(ingestion);
        setModelPerformance(performance);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 如果数据正在加载，显示加载动画
  if (loading) {
    return (
      <div className="dashboard-cards">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载可视化卡片...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-cards">
      {/* 第一行卡片 */}
      <div className="dashboard-row">
        <ModelHealthCard modelHealth={modelHealth} />
        {/* <DataQualityCard dataQuality={dataQuality} /> */}
      </div>
      
      {/* 第二行卡片 */}
      <div className="dashboard-row">
        {/* <FeatureImportanceCard featureImportance={featureImportance} />
        <DataIngestionCard ingestionStats={ingestionStats} /> */}
      </div>
      
      {/* 第三行卡片 */}
      <div className="dashboard-row">
        {/* <ModelPerformanceCard modelPerformance={modelPerformance} /> */}
      </div>
    </div>
  );
};

export default DashboardCards; 