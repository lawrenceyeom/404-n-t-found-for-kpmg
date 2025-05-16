import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const ModelPerformance = ({ modelPerformance }) => {
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('准确率');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [rowHighlight, setRowHighlight] = useState(null);
  const highlight = useDataUpdateHighlight(modelPerformance);

  useEffect(() => {
    const fetchTrainingHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/model-training-history`);
        const data = await response.json();
        setTrainingHistory(data);
      } catch (error) {
        console.error('Error fetching training history:', error);
        setTrainingHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchTrainingHistory();
  }, []);

  // Get the best model for the selected metric
  const getBestModel = () => {
    if (!modelPerformance || modelPerformance.length === 0) return null;
    
    return modelPerformance.reduce((best, current) => {
      return current[selectedMetric] > best[selectedMetric] ? current : best;
    }, modelPerformance[0]);
  };

  // Get the average value for the selected metric across all models
  const getAverageMetric = () => {
    if (!modelPerformance || modelPerformance.length === 0) return 0;
    
    const sum = modelPerformance.reduce((acc, model) => acc + model[selectedMetric], 0);
    return sum / modelPerformance.length;
  };

  // Open model details panel with row highlight effect
  const openModelDetails = (model, index) => {
    setRowHighlight(index);
    
    // Add a slight delay for better visual feedback
    setTimeout(() => {
      setSelectedModel(model);
      setIsDetailsPanelOpen(true);
      
      // Remove highlight effect after panel opens
      setTimeout(() => {
        setRowHighlight(null);
      }, 300);
    }, 150);
  };

  // Close model details panel
  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    // Add delay to wait for animation before removing selected model
    setTimeout(() => {
      setSelectedModel(null);
    }, 300);
  };

  // Get color based on metric value
  const getMetricColor = (value) => {
    if (value >= 0.9) return '#4be1a0';
    if (value >= 0.8) return '#e6b45e';
    return '#e65e5e';
  };

  // Get improvement percentage between versions
  const getImprovement = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get the latest production version from training history
  const getCurrentVersion = () => {
    if (!trainingHistory || trainingHistory.length === 0) return null;
    
    return trainingHistory.find(record => record.备注 === '当前生产版本');
  };

  // Show toast notification
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 2000);
    }, 10);
  };

  const bestModel = getBestModel();
  const averageMetric = getAverageMetric();
  const currentVersion = getCurrentVersion();

  // Available metrics
  const metrics = ['准确率', '精确率', '召回率', 'F1得分', 'AUC'];

  return (
    <div className={`performance-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="section-header">
        <div>
          <h3 className="section-title">模型性能指标</h3>
          <p className="section-description">
            各AI模型精确度、召回率等核心指标对比，及性能提升历史。
          </p>
        </div>
        
        <div className="metric-selector">
          <span>指标选择：</span>
          <div className="metric-buttons">
            {metrics.map(metric => (
              <button
                key={metric}
                className={`metric-button ${selectedMetric === metric ? 'active' : ''}`}
                onClick={() => setSelectedMetric(metric)}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="metrics-summary">
        <div className="metric-card best">
          <div className="metric-card-label">最佳模型</div>
          <div className="metric-card-value">
            {bestModel ? 
              <span style={{ color: getMetricColor(bestModel[selectedMetric]) }}>
                {(bestModel[selectedMetric] * 100).toFixed(1)}%
              </span> : 
              '暂无数据'
            }
          </div>
          <div className="metric-card-description">
            {bestModel ? bestModel['模型名称'] : ''}
          </div>
        </div>
        
        <div className="metric-card average">
          <div className="metric-card-label">平均水平</div>
          <div className="metric-card-value">
            <span style={{ color: getMetricColor(averageMetric) }}>
              {(averageMetric * 100).toFixed(1)}%
            </span>
          </div>
          <div className="metric-card-description">
            基于 {modelPerformance.length} 个模型
          </div>
        </div>
        
        <div className="metric-card current">
          <div className="metric-card-label">当前生产版本</div>
          <div className="metric-card-value">
            {currentVersion ? 
              <span style={{ color: getMetricColor(currentVersion.准确率) }}>
                {(currentVersion.准确率 * 100).toFixed(1)}%
              </span> : 
              '暂无数据'
            }
          </div>
          <div className="metric-card-description">
            {currentVersion ? currentVersion.版本 : ''}
          </div>
        </div>
      </div>
      
      <div className="performance-comparison">
        <div className="section-header-inner">
          <h4 className="inner-title">模型性能对比</h4>
          <div className="tooltip">?
            <span className="tooltiptext">点击表格行可查看模型详情</span>
          </div>
        </div>
        
        <div className="table-container">
          <table className="performance-table">
            <thead>
              <tr>
                <th>模型名称</th>
                {metrics.map(metric => (
                  <th 
                    key={metric}
                    className={selectedMetric === metric ? 'highlighted' : ''}
                  >
                    {metric}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelPerformance.map((model, index) => (
                <tr 
                  key={index} 
                  className={`${index % 2 === 0 ? 'even-row' : 'odd-row'}${model === bestModel ? ' best-model' : ''}${rowHighlight === index ? ' row-highlight' : ''}`}
                  onClick={() => openModelDetails(model, index)}
                >
                  <td className="model-name">{model['模型名称']}</td>
                  {metrics.map(metric => (
                    <td 
                      key={metric}
                      className={selectedMetric === metric ? 'highlighted' : ''}
                    >
                      <div className="metric-cell">
                        <div className="metric-bar-container">
                          <div 
                            className="metric-bar"
                            style={{ 
                              width: `${model[metric] * 100}%`,
                              backgroundColor: getMetricColor(model[metric])
                            }}
                          ></div>
                        </div>
                        <span className="metric-value">
                          {(model[metric] * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="metrics-legend">
          <div className="legend-title">指标说明：</div>
          <ul className="legend-list">
            <li><strong>准确率</strong>：正确预测的比例</li>
            <li><strong>精确率</strong>：预测为正类中实际为正类的比例</li>
            <li><strong>召回率</strong>：实际为正类中被正确预测的比例</li>
            <li><strong>F1得分</strong>：精确率和召回率的调和平均值</li>
            <li><strong>AUC</strong>：ROC曲线下面积，衡量模型区分正负样本的能力</li>
          </ul>
        </div>
      </div>
      
      <div className="training-history">
        <div className="section-header-inner">
          <h4 className="inner-title">模型迭代历史（风险预测模型）</h4>
          <div className="visualization-toggle">
            <div 
              className="toggle-button"
              onClick={() => showToast("性能趋势图功能即将上线")}
            >
              查看性能趋势图
            </div>
          </div>
        </div>
        
        {historyLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>加载模型迭代历史...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>版本</th>
                  <th>训练日期</th>
                  <th>准确率</th>
                  <th>训练样本数</th>
                  <th>训练时长</th>
                  <th>提升</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                {trainingHistory.map((record, index) => {
                  // Calculate improvement compared to previous version
                  const previousRecord = index < trainingHistory.length - 1 ? trainingHistory[index + 1] : null;
                  const improvement = getImprovement(record.准确率, previousRecord?.准确率);
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td className={`version-cell ${record.备注 === '当前生产版本' ? 'current-version' : ''}`}>
                        {record.版本}
                      </td>
                      <td>{record.训练日期}</td>
                      <td className="accuracy-cell">
                        <span style={{ color: getMetricColor(record.准确率) }}>
                          {(record.准确率 * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="sample-cell">{record.训练样本数.toLocaleString()}</td>
                      <td>{record.训练时长}</td>
                      <td className="improvement-cell">
                        {previousRecord && (
                          <span className={improvement >= 0 ? 'positive' : 'negative'}>
                            {improvement >= 0 ? '+' : ''}{improvement.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className={record.备注 === '当前生产版本' ? 'current-version-note' : ''}>
                        {record.备注}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="training-actions">
          <button 
            className="action-button" 
            onClick={() => showToast("即将训练新版本模型")}
          >
            训练新版本
          </button>
          <button 
            className="action-button secondary"
            onClick={() => showToast("即将查看详细训练记录")}
          >
            查看详细训练记录
          </button>
        </div>
      </div>
      
      {/* Model Details Side Panel */}
      <div className={`details-side-panel ${isDetailsPanelOpen ? 'open' : ''}`}>
        {selectedModel && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">{selectedModel['模型名称']} - 性能详情</h3>
              <button className="panel-close" onClick={closeDetailsPanel}>×</button>
            </div>
            
            <div className="panel-body">
              <div className="metrics-detail-grid">
                {metrics.map(metric => (
                  <div key={metric} className="metric-detail-card">
                    <div className="metric-name">{metric}</div>
                    <div className="metric-large-value" style={{ color: getMetricColor(selectedModel[metric]) }}>
                      {(selectedModel[metric] * 100).toFixed(1)}%
                    </div>
                    <div className="metric-rank">
                      排名: {modelPerformance.sort((a, b) => b[metric] - a[metric])
                        .findIndex(m => m['模型名称'] === selectedModel['模型名称']) + 1}/{modelPerformance.length}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="model-comparison">
                <h4>与平均水平对比</h4>
                <div className="comparison-chart">
                  {metrics.map(metric => {
                    const diff = selectedModel[metric] - getAverageMetric();
                    return (
                      <div key={metric} className="comparison-item">
                        <div className="comparison-label">{metric}</div>
                        <div className="comparison-bar-container">
                          <div className="comparison-avg-marker"></div>
                          <div 
                            className={`comparison-bar ${diff >= 0 ? 'positive' : 'negative'}`}
                            style={{ 
                              width: `${Math.abs(diff) * 100 * 3}%`,
                              left: diff >= 0 ? '50%' : `calc(50% - ${Math.abs(diff) * 100 * 3}%)`
                            }}
                          ></div>
                        </div>
                        <div className="comparison-value">
                          <span className={diff >= 0 ? 'positive' : 'negative'}>
                            {diff >= 0 ? '+' : ''}{(diff * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="model-details-actions">
                <button 
                  className="details-button"
                  onClick={() => showToast("即将查看预测详情")}
                >
                  查看预测详情
                </button>
                <button 
                  className="details-button"
                  onClick={() => showToast("即将分析错误用例")}
                >
                  分析错误用例
                </button>
                <button 
                  className="details-button"
                  onClick={() => showToast("即将导出性能报告")}
                >
                  导出性能报告
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Backdrop for side panel */}
      {isDetailsPanelOpen && (
        <div className="panel-backdrop" onClick={closeDetailsPanel}></div>
      )}
      
      <style jsx>{`
        .performance-container {
          position: relative;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .section-title {
          margin-top: 0;
          margin-bottom: 16px;
          color: #eaf6ff;
        }
        
        .section-description {
          font-size: 14px;
          color: #99b7ff;
          margin: 0;
        }
        
        .metric-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #eaf6ff;
        }
        
        .metric-buttons {
          display: flex;
          gap: 8px;
        }
        
        .metric-button {
          background-color: #1e3a6d;
          color: #99b7ff;
          border: 1px solid #2a3c6e;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .metric-button:hover {
          background-color: #2a4d8d;
          color: #eaf6ff;
        }
        
        .metric-button:active {
          background-color: #243d6b;
        }
        
        .metric-button.active {
          background-color: #4be1a0;
          color: #0a1f44;
          border-color: #4be1a0;
        }
        
        .metrics-summary {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .metric-card {
          background-color: #15294e;
          border-radius: 10px;
          padding: 20px;
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .metric-card.best {
          border-color: #4be1a0;
        }
        
        .metric-card.current {
          border-color: #5e9de6;
        }
        
        .metric-card-label {
          font-size: 14px;
          color: #99b7ff;
          margin-bottom: 8px;
        }
        
        .metric-card-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .metric-card-description {
          font-size: 14px;
          color: #99b7ff;
          text-align: center;
        }
        
        .performance-comparison, .training-history {
          background-color: #15294e;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #2a3c6e;
        }
        
        .section-header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .inner-title {
          margin: 0;
          color: #eaf6ff;
        }
        
        .tooltip {
          position: relative;
          display: inline-block;
          background-color: #1e3a6d;
          color: #99b7ff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          text-align: center;
          line-height: 20px;
          font-size: 14px;
          cursor: help;
        }
        
        .tooltiptext {
          visibility: hidden;
          width: 160px;
          background-color: #0a1f44;
          color: #eaf6ff;
          text-align: center;
          padding: 6px 10px;
          border-radius: 6px;
          position: absolute;
          z-index: 1;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          transition: opacity 0.3s;
          font-size: 12px;
        }
        
        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }
        
        .visualization-toggle {
          display: flex;
          gap: 12px;
        }
        
        .toggle-button {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border-radius: 4px;
          padding: 6px 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .toggle-button:hover {
          background-color: #2a4d8d;
        }
        
        .toggle-button:active {
          background-color: #243d6b;
        }
        
        .table-container {
          overflow-x: auto;
          margin-bottom: 16px;
        }
        
        .performance-table, .history-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .performance-table th, .performance-table td,
        .history-table th, .history-table td {
          padding: 12px;
          border: 1px solid #2a3c6e;
          text-align: center;
        }
        
        .performance-table th, .history-table th {
          background-color: #1e3a6d;
          color: #eaf6ff;
          font-weight: bold;
        }
        
        .performance-table th.highlighted {
          background-color: #2a4d8d;
          color: #4be1a0;
        }
        
        .performance-table td.highlighted {
          background-color: rgba(75, 225, 160, 0.1);
        }
        
        .even-row {
          background-color: #182c54;
        }
        
        .odd-row {
          background-color: #15294e;
        }
        
        .performance-table .best-model {
          background-color: rgba(75, 225, 160, 0.05);
          border-left: 3px solid #4be1a0;
        }
        
        .row-highlight {
          background-color: rgba(75, 225, 160, 0.1) !important;
          transition: background-color 0.3s ease;
        }
        
        .performance-table tr {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .performance-table tr:hover {
          background-color: rgba(75, 225, 160, 0.05);
        }
        
        .model-name {
          text-align: left;
          font-weight: bold;
          color: #eaf6ff;
        }
        
        .metric-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        
        .metric-bar-container {
          height: 8px;
          background-color: #1e3a6d;
          border-radius: 4px;
          overflow: hidden;
          width: 80px;
        }
        
        .metric-bar {
          height: 100%;
          background-color: #4be1a0;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .metric-value {
          font-weight: bold;
          min-width: 45px;
        }
        
        .metrics-legend {
          border-top: 1px solid #2a3c6e;
          padding-top: 16px;
          color: #99b7ff;
        }
        
        .legend-title {
          margin-bottom: 8px;
          color: #eaf6ff;
        }
        
        .legend-list {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 0;
          margin: 0;
          list-style-type: none;
        }
        
        .legend-list li {
          position: relative;
          padding-left: 20px;
          font-size: 14px;
        }
        
        .legend-list li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #4be1a0;
          font-size: 18px;
          line-height: 1;
        }
        
        .legend-list strong {
          color: #eaf6ff;
        }
        
        .version-cell {
          font-weight: bold;
          color: #eaf6ff;
        }
        
        .current-version {
          position: relative;
          color: #4be1a0;
        }
        
        .current-version::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: #4be1a0;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        .current-version-note {
          color: #4be1a0;
          font-weight: bold;
        }
        
        .accuracy-cell {
          font-weight: bold;
        }
        
        .sample-cell {
          text-align: right;
        }
        
        .improvement-cell {
          font-weight: bold;
        }
        
        .improvement-cell .positive {
          color: #4be1a0;
        }
        
        .improvement-cell .negative {
          color: #e65e5e;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(75, 225, 160, 0.1);
          border-left-color: #4be1a0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .training-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .action-button {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
        }
        
        .action-button:active {
          transform: translateY(0);
        }
        
        .action-button.secondary {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
        }
        
        .action-button.secondary:hover {
          background-color: #2a4d8d;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .details-side-panel {
          position: fixed;
          top: 0;
          right: -500px;
          width: 500px;
          max-width: 90vw;
          height: 100vh;
          background-color: #182c54;
          border-left: 1px solid #2a3c6e;
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
          z-index: 1100;
          display: flex;
          flex-direction: column;
          transition: right 0.3s ease;
          overflow: hidden;
        }
        
        .details-side-panel.open {
          right: 0;
        }
        
        .panel-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1050;
          animation: fadeIn 0.3s ease;
        }
        
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #2a3c6e;
        }
        
        .panel-title {
          margin: 0;
          color: #4be1a0;
          font-size: 20px;
        }
        
        .panel-close {
          background: none;
          border: none;
          color: #eaf6ff;
          font-size: 24px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }
        
        .panel-close:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .panel-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }
        
        .metrics-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .metric-detail-card {
          background-color: #15294e;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease;
        }
        
        .metric-detail-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .metric-name {
          font-size: 14px;
          color: #99b7ff;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .metric-large-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .metric-rank {
          font-size: 12px;
          color: #99b7ff;
        }
        
        .model-comparison {
          margin-bottom: 24px;
        }
        
        .model-comparison h4 {
          color: #eaf6ff;
          margin-top: 0;
          margin-bottom: 16px;
        }
        
        .comparison-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .comparison-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .comparison-label {
          width: 80px;
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .comparison-bar-container {
          flex: 1;
          height: 8px;
          background-color: #1e3a6d;
          border-radius: 4px;
          position: relative;
        }
        
        .comparison-avg-marker {
          position: absolute;
          top: -4px;
          bottom: -4px;
          width: 2px;
          background-color: #99b7ff;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .comparison-bar {
          position: absolute;
          height: 100%;
          top: 0;
          border-radius: 4px;
        }
        
        .comparison-bar.positive {
          background-color: #4be1a0;
        }
        
        .comparison-bar.negative {
          background-color: #e65e5e;
        }
        
        .comparison-value {
          width: 60px;
          text-align: right;
          font-weight: bold;
          font-size: 14px;
        }
        
        .positive {
          color: #4be1a0;
        }
        
        .negative {
          color: #e65e5e;
        }
        
        .model-details-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        
        .details-button {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .details-button:hover {
          background-color: #2a4d8d;
          transform: translateY(-2px);
        }
        
        .details-button:active {
          transform: translateY(0);
          background-color: #243d6b;
        }
        
        .toast-notification {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #4be1a0;
          color: #0a1f44;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 2000;
          transform: translateY(100px);
          opacity: 0;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        
        .toast-notification.show {
          transform: translateY(0);
          opacity: 1;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .section-header,
          .section-header-inner,
          .metric-selector,
          .training-actions {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .metric-buttons {
            flex-wrap: wrap;
          }
          
          .metrics-legend .legend-list {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelPerformance; 