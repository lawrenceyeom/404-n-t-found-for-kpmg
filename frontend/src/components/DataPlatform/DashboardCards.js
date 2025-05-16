import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../../constants';
import './DataPlatform.css';
import { useNavigate } from 'react-router-dom';

// 导入卡片组件
import ModelHealthCard from './cards/ModelHealthCard';
import DataQualityCard from './cards/DataQualityCard';
import FeatureImportanceCard from './cards/FeatureImportanceCard';
import DataIngestionCard from './cards/DataIngestionCard';
import ModelPerformanceCard from './cards/ModelPerformanceCard';
import ModelTrainingHistoryCard from './cards/ModelTrainingHistoryCard';

const DashboardCards = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [modelHealth, setModelHealth] = useState([]);
  const [dataQuality, setDataQuality] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [ingestionStats, setIngestionStats] = useState([]);
  const [modelPerformance, setModelPerformance] = useState([]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 默认30秒
  const [expandedCard, setExpandedCard] = useState(null);
  const [animateCardIndex, setAnimateCardIndex] = useState(null);

  // 数据加载函数
  const fetchData = useCallback(async (showLoadingState = true) => {
    if (showLoadingState && !loading) setLoading(true);
    try {
      // 并行获取所有需要的数据
      const [
        healthRes,
        qualityRes,
        featuresRes,
        ingestionRes,
        performanceRes,
        trainingRes
      ] = await Promise.all([
        fetch(`${API_BASE}/platform/model-health`),
        fetch(`${API_BASE}/platform/data-quality-metrics`),
        fetch(`${API_BASE}/platform/feature-importance/risk_pred_001`),
        fetch(`${API_BASE}/platform/data-ingestion-stats`),
        fetch(`${API_BASE}/platform/model-performance`),
        fetch(`${API_BASE}/platform/model-training-history`)
      ]);

      // 检查响应
      if (!healthRes.ok || !qualityRes.ok || !featuresRes.ok || 
          !ingestionRes.ok || !performanceRes.ok || !trainingRes.ok) {
        throw new Error('数据获取失败，请稍后重试');
      }

      // 解析JSON响应
      const health = await healthRes.json();
      const quality = await qualityRes.json();
      const features = await featuresRes.json();
      const ingestion = await ingestionRes.json();
      const performance = await performanceRes.json();
      const training = await trainingRes.json();

      // 更新状态
      setModelHealth(health);
      setDataQuality(quality);
      setFeatureImportance(features);
      setIngestionStats(ingestion);
      setModelPerformance(performance);
      setTrainingHistory(training);
      setLastUpdated(new Date());
      setError(null);
      
      // 数据加载完成后，标记一个随机卡片为动画状态
      if (!showLoadingState && Math.random() > 0.5) {
        const randomCardIndex = Math.floor(Math.random() * 6);
        setAnimateCardIndex(randomCardIndex);
        setTimeout(() => setAnimateCardIndex(null), 2000);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('数据加载失败，请检查网络连接后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始数据加载
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    let intervalId;
    if (isAutoRefresh && !loading) {
      intervalId = setInterval(() => {
        fetchData(false); // 不显示全页面加载状态
      }, refreshInterval);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoRefresh, refreshInterval, fetchData, loading]);

  // 页面导航映射
  const navigationMap = {
    0: '/data-platform/model-health',     // 模型健康卡片
    1: '/data-platform/data-quality',     // 数据质量卡片
    2: '/data-platform/features',         // 特征工程卡片
    3: '/data-platform/ingestion',        // 数据摄入卡片
    4: '/data-platform/model-perf',       // 模型性能卡片
    5: '/data-platform/models'            // 模型管理卡片
  };

  // 处理卡片点击 - 导航到相应详情页面
  const handleCardClick = (index) => {
    if (navigationMap[index]) {
      navigate(navigationMap[index]);
    }
  };

  // 卡片展开/收起
  const toggleCardExpand = (index) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  // 模态框显示详细信息
  const showCardDetails = (index) => {
    setSelectedCardIndex(index);
  };

  // 如果数据正在加载，显示加载动画
  if (loading && !modelHealth.length) {
    return (
      <div className="dashboard-cards">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载可视化卡片...</p>
        </div>
      </div>
    );
  }

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="dashboard-cards">
        <div className="error-container">
          <div className="error-icon">!</div>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => fetchData(true)}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 根据卡片索引获取模态框内容
  const getModalContent = (index) => {
    switch(index) {
      case 0: // 模型健康详情
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>模型健康概览</h4>
              <div className="health-summary">
                <div className="health-metric">
                  <span className="metric-label">健康模型</span>
                  <span className="metric-value health">{modelHealth.filter(m => m.status === '健康').length}</span>
                </div>
                <div className="health-metric">
                  <span className="metric-label">需关注模型</span>
                  <span className="metric-value warning">{modelHealth.filter(m => m.status !== '健康').length}</span>
                </div>
                <div className="health-metric">
                  <span className="metric-label">平均漂移分数</span>
                  <span className="metric-value">{(modelHealth.reduce((acc, m) => acc + m.drift_score, 0) / modelHealth.length).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>主要告警</h4>
              <ul className="alerts-list">
                {modelHealth.flatMap(m => 
                  m.alerts?.map((alert, idx) => (
                    <li key={`${m.model_name}-${idx}`} className="alert-item">
                      <span className="alert-model">{m.model_name}</span>
                      <span className="alert-text">{alert}</span>
                    </li>
                  )) || []
                )}
              </ul>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/model-health');
              }}
            >
              查看完整报告
            </button>
          </div>
        );
      case 1: // 数据质量详情
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>数据质量概览</h4>
              <div className="quality-summary">
                <div className="quality-metric">
                  <span className="metric-label">整体质量分</span>
                  <span className="metric-value health">
                    {Math.round(dataQuality.reduce((acc, item) => {
                      const metrics = ['完整性', '准确性', '一致性', '时效性'];
                      const sum = metrics.reduce((s, m) => s + (item[m] || 0), 0);
                      return acc + (sum / metrics.length);
                    }, 0) / dataQuality.length)}
                  </span>
                </div>
                <div className="quality-metric">
                  <span className="metric-label">数据源数量</span>
                  <span className="metric-value">{dataQuality.length}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>最新更新数据</h4>
              <div className="recent-updates">
                {dataQuality.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="update-item">
                    <span className="update-source">{item['数据类型']}</span>
                    <span className="update-time">{item['最近更新']}</span>
                    <span className="update-records">{item['记录数'].toLocaleString()} 条记录</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/data-quality');
              }}
            >
              查看完整报告
            </button>
          </div>
        );
      case 2: // 特征重要性详情
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>模型特征重要性</h4>
              <div className="features-top">
                <p>对预测结果影响最大的前5个特征:</p>
                <div className="top-features">
                  {featureImportance.sort((a, b) => b.重要性 - a.重要性).slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="top-feature-item">
                      <span className="feature-rank">{idx + 1}</span>
                      <span className="feature-name">{feature.特征名称}</span>
                      <span className="feature-category" style={{
                        backgroundColor: feature.类别 === '财务特征' ? 'rgba(75, 225, 160, 0.2)' : 
                                         feature.类别 === '运营特征' ? 'rgba(230, 180, 94, 0.2)' :
                                         'rgba(94, 157, 230, 0.2)',
                        color: feature.类别 === '财务特征' ? '#4be1a0' : 
                               feature.类别 === '运营特征' ? '#e6b45e' : '#5e9de6'
                      }}>{feature.类别}</span>
                      <span className="feature-importance">{feature.重要性.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/features');
              }}
            >
              查看特征工程详情
            </button>
          </div>
        );
      case 3: // 数据摄入详情
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>数据摄入统计</h4>
              <div className="ingestion-summary">
                <div className="ingestion-metric">
                  <span className="metric-label">总数据量</span>
                  <span className="metric-value">{ingestionStats.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</span>
                </div>
                <div className="ingestion-metric">
                  <span className="metric-label">日均摄入</span>
                  <span className="metric-value">{Math.round(ingestionStats.reduce((sum, item) => sum + item.total, 0) / ingestionStats.length).toLocaleString()}</span>
                </div>
                <div className="ingestion-metric">
                  <span className="metric-label">最新更新</span>
                  <span className="metric-value">{ingestionStats[ingestionStats.length - 1]?.last_ingest_time || '无数据'}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>数据源分布</h4>
              <div className="source-distribution">
                {['财务数据', '运营数据', '舆情数据', '宏观数据'].map(source => {
                  const total = ingestionStats.reduce((sum, item) => sum + (item[source] || 0), 0);
                  const percentage = Math.round((total / ingestionStats.reduce((sum, item) => sum + item.total, 0)) * 100);
                  return (
                    <div key={source} className="distribution-item">
                      <span className="source-name">{source}</span>
                      <div className="source-bar-container">
                        <div className="source-bar" style={{
                          width: `${percentage}%`,
                          backgroundColor: source === '财务数据' ? '#4be1a0' : 
                                          source === '运营数据' ? '#e6b45e' :
                                          source === '舆情数据' ? '#e65e5e' : '#5e9de6'
                        }}></div>
                      </div>
                      <span className="source-percentage">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/ingestion');
              }}
            >
              查看完整摄入统计
            </button>
          </div>
        );
      case 4: // 模型性能详情
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>模型性能概览</h4>
              <div className="performance-summary">
                <div className="performance-metric">
                  <span className="metric-label">最佳模型</span>
                  <span className="metric-value">
                    {modelPerformance.reduce((best, current) => 
                      current['准确率'] > best['准确率'] ? current : best
                    )['模型名称']}
                  </span>
                </div>
                <div className="performance-metric">
                  <span className="metric-label">平均准确率</span>
                  <span className="metric-value">
                    {(modelPerformance.reduce((sum, model) => sum + model['准确率'], 0) / modelPerformance.length * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>模型对比</h4>
              <div className="models-comparison">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>模型</th>
                      <th>准确率</th>
                      <th>F1得分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelPerformance.slice(0, 4).map((model, idx) => (
                      <tr key={idx}>
                        <td>{model['模型名称']}</td>
                        <td>{(model['准确率'] * 100).toFixed(1)}%</td>
                        <td>{(model['F1得分'] * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/model-perf');
              }}
            >
              查看详细性能报告
            </button>
          </div>
        );
      case 5: // 模型训练历史
        return (
          <div className="modal-details">
            <div className="detail-section">
              <h4>模型训练历史</h4>
              <div className="training-summary">
                <div className="training-metric">
                  <span className="metric-label">最新版本</span>
                  <span className="metric-value">{trainingHistory[0]?.version || 'N/A'}</span>
                </div>
                <div className="training-metric">
                  <span className="metric-label">训练日期</span>
                  <span className="metric-value">{trainingHistory[0]?.date || 'N/A'}</span>
                </div>
                <div className="training-metric">
                  <span className="metric-label">准确率提升</span>
                  <span className="metric-value">
                    {trainingHistory.length >= 2 ? 
                      ((trainingHistory[0]?.accuracy - trainingHistory[1]?.accuracy) * 100).toFixed(2) + '%' : 
                      'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>性能趋势</h4>
              <div className="accuracy-trend">
                {trainingHistory.slice(0, 5).map((history, idx) => (
                  <div key={idx} className="trend-item">
                    <span className="version-label">{history.version}</span>
                    <div className="accuracy-bar-container">
                      <div className="accuracy-bar" style={{
                        width: `${history.accuracy * 100}%`,
                        backgroundColor: idx === 0 ? '#4be1a0' : '#1e3a6d'
                      }}></div>
                    </div>
                    <span className="accuracy-value">{(history.accuracy * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <button 
              className="detail-action-button"
              onClick={() => {
                setSelectedCardIndex(null);
                navigate('/data-platform/models');
              }}
            >
              查看模型管理
            </button>
          </div>
        );
      default:
        return <div className="modal-details">详情加载中...</div>;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h2 className="dashboard-title">可视化仪表盘</h2>
        <div className="dashboard-controls">
          <div className="refresh-control">
            <label className="refresh-label">
              <input 
                type="checkbox" 
                checked={isAutoRefresh} 
                onChange={() => setIsAutoRefresh(!isAutoRefresh)}
                className="refresh-checkbox"
              />
              <span className="refresh-text">自动刷新</span>
            </label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="refresh-select"
              disabled={!isAutoRefresh}
            >
              <option value={10000}>10秒</option>
              <option value={30000}>30秒</option>
              <option value={60000}>1分钟</option>
              <option value={300000}>5分钟</option>
            </select>
          </div>
          <button 
            className="manual-refresh-button"
            onClick={() => fetchData(true)}
            disabled={loading}
          >
            {loading ? '刷新中...' : '立即刷新'}
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="last-updated">
          最后更新: {lastUpdated.toLocaleString()}
        </div>
      )}

      <div className="dashboard-cards">
        {/* 第一行卡片 */}
        <div className="dashboard-row">
          <div 
            className={`card-wrapper ${expandedCard === 0 ? 'expanded' : ''} ${animateCardIndex === 0 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(0)}
          >
            <ModelHealthCard 
              modelHealth={modelHealth} 
              onCardClick={() => handleCardClick(0)}
              onDetailsClick={() => showCardDetails(0)}
              isExpanded={expandedCard === 0}
            />
            {animateCardIndex === 0 && <div className="card-update-indicator">数据已更新</div>}
          </div>
          <div 
            className={`card-wrapper ${expandedCard === 1 ? 'expanded' : ''} ${animateCardIndex === 1 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(1)}
          >
            <DataQualityCard 
              dataQuality={dataQuality} 
              onCardClick={() => handleCardClick(1)}
              onDetailsClick={() => showCardDetails(1)}
              isExpanded={expandedCard === 1}
            />
            {animateCardIndex === 1 && <div className="card-update-indicator">数据已更新</div>}
          </div>
        </div>
        
        {/* 第二行卡片 */}
        <div className="dashboard-row">
          <div 
            className={`card-wrapper ${expandedCard === 2 ? 'expanded' : ''} ${animateCardIndex === 2 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(2)}
          >
            <FeatureImportanceCard 
              featureImportance={featureImportance} 
              onCardClick={() => handleCardClick(2)}
              onDetailsClick={() => showCardDetails(2)}
              isExpanded={expandedCard === 2}
            />
            {animateCardIndex === 2 && <div className="card-update-indicator">数据已更新</div>}
          </div>
          <div 
            className={`card-wrapper ${expandedCard === 3 ? 'expanded' : ''} ${animateCardIndex === 3 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(3)}
          >
            <DataIngestionCard 
              ingestionStats={ingestionStats} 
              onCardClick={() => handleCardClick(3)}
              onDetailsClick={() => showCardDetails(3)}
              isExpanded={expandedCard === 3}
            />
            {animateCardIndex === 3 && <div className="card-update-indicator">数据已更新</div>}
          </div>
        </div>
        
        {/* 第三行卡片 */}
        <div className="dashboard-row">
          <div 
            className={`card-wrapper ${expandedCard === 4 ? 'expanded' : ''} ${animateCardIndex === 4 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(4)}
          >
            <ModelPerformanceCard 
              modelPerformance={modelPerformance} 
              onCardClick={() => handleCardClick(4)}
              onDetailsClick={() => showCardDetails(4)}
              isExpanded={expandedCard === 4}
            />
            {animateCardIndex === 4 && <div className="card-update-indicator">数据已更新</div>}
          </div>
          <div 
            className={`card-wrapper ${expandedCard === 5 ? 'expanded' : ''} ${animateCardIndex === 5 ? 'card-highlight-animation' : ''}`}
            onClick={() => toggleCardExpand(5)}
          >
            <ModelTrainingHistoryCard 
              history={trainingHistory} 
              onCardClick={() => handleCardClick(5)}
              onDetailsClick={() => showCardDetails(5)}
              isExpanded={expandedCard === 5}
            />
            {animateCardIndex === 5 && <div className="card-update-indicator">数据已更新</div>}
          </div>
        </div>
      </div>

      {/* 数据刷新中悬浮提示 */}
      {loading && modelHealth.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-indicator">
            <div className="loading-spinner-sm"></div>
            <span>数据刷新中...</span>
          </div>
        </div>
      )}

      {/* 卡片详细信息模态框 */}
      {selectedCardIndex !== null && (
        <div className="card-modal-overlay" onClick={() => setSelectedCardIndex(null)}>
          <div className="card-modal" onClick={e => e.stopPropagation()}>
            <div className="card-modal-header">
              <h3>
                {selectedCardIndex === 0 && '模型健康详情'}
                {selectedCardIndex === 1 && '数据质量详情'}
                {selectedCardIndex === 2 && '特征重要性详情'}
                {selectedCardIndex === 3 && '数据摄入详情'}
                {selectedCardIndex === 4 && '模型性能详情'}
                {selectedCardIndex === 5 && '模型训练历史详情'}
              </h3>
              <button 
                className="modal-close-button"
                onClick={() => setSelectedCardIndex(null)}
              >
                ×
              </button>
            </div>
            <div className="card-modal-content">
              {getModalContent(selectedCardIndex)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCards; 