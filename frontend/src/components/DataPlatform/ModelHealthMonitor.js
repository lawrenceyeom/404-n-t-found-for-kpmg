import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const ModelHealthMonitor = ({ modelHealth }) => {
  const location = useLocation();
  const [selectedModel, setSelectedModel] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [cardRipple, setCardRipple] = useState({ active: false, x: 0, y: 0, id: null });
  const [animateEntrance, setAnimateEntrance] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [modelFilter, setModelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('status');
  const [showRealTimeAlerts, setShowRealTimeAlerts] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const highlight = useDataUpdateHighlight(modelHealth);

  // Check if navigated from dashboard
  useEffect(() => {
    // Set animation flag on component mount
    setAnimateEntrance(true);
    
    // Clear animation flag after animation completes
    const timer = setTimeout(() => {
      setAnimateEntrance(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate real-time alerts
  useEffect(() => {
    if (showRealTimeAlerts) {
      // Initial alerts
      setAlerts([
        { id: 1, timestamp: new Date().toISOString(), message: '风险预测模型：数据漂移检测到异常值', level: 'warning' },
        { id: 2, timestamp: new Date(Date.now() - 15 * 60000).toISOString(), message: '欺诈检测模型：性能下降 5%', level: 'critical' }
      ]);
      
      // Add new alerts periodically
      const alertInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          const alertTypes = [
            { message: '客户流失模型：需要重新训练', level: 'info' },
            { message: '信用评分模型：响应时间增加', level: 'warning' },
            { message: '异常交易检测：误报率上升', level: 'critical' }
          ];
          
          const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          
          setAlerts(prev => [
            { 
              id: Date.now(), 
              timestamp: new Date().toISOString(), 
              message: randomAlert.message, 
              level: randomAlert.level 
            },
            ...prev.slice(0, 9) // Keep last 10 alerts
          ]);
        }
      }, 30000); // New alert every 30 seconds (with 30% probability)
      
      return () => clearInterval(alertInterval);
    }
  }, [showRealTimeAlerts]);

  const getStatusClass = (status) => {
    return status === '健康' ? 'status-healthy' : 'status-warning';
  };

  const getMetricIndicator = (value, metric) => {
    // Different thresholds for different metrics
    if (metric === 'drift_score') {
      return value < 0.2 ? 'good' : value < 0.3 ? 'warning' : 'critical';
    } else if (metric === 'performance_stability') {
      return value > 0.9 ? 'good' : value > 0.8 ? 'warning' : 'critical';
    } else if (metric === 'error_rate') {
      return value < 0.03 ? 'good' : value < 0.05 ? 'warning' : 'critical';
    } else if (metric === 'response_time') {
      return value < 150 ? 'good' : value < 200 ? 'warning' : 'critical';
    }
    return 'good';
  };
  
  // Format timestamp relative to now
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}小时前`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}天前`;
  };

  // Open model details side panel with ripple effect
  const handleModelDetails = (modelId, e) => {
    if (e) {
      // Create ripple effect
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setCardRipple({ active: true, x, y, id: modelId });
      
      // Small delay for better visual feedback
      setTimeout(() => {
        setSelectedModel(modelId);
        setIsDetailsPanelOpen(true);
        setCardRipple({ active: false, x: 0, y: 0, id: null });
      }, 300);
    } else {
      setSelectedModel(modelId);
      setIsDetailsPanelOpen(true);
    }
  };

  // Close details panel
  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    // Add small delay before removing selected model for animation
    setTimeout(() => {
      setSelectedModel(null);
    }, 300);
  };

  // Fix issues with model
  const handleFixIssues = (modelId, e) => {
    e.stopPropagation();
    showToast('开始修复模型问题，这可能需要几分钟时间');
  };
  
  // Retrain model
  const handleRetrain = (modelId, e) => {
    e.stopPropagation();
    showToast(`已将模型加入训练队列，完成后会通知您`);
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

  // Filter and sort models
  const getFilteredModels = () => {
    let filtered = [...(modelHealth || [])];
    
    // Apply search filter
    if (modelFilter) {
      filtered = filtered.filter(model => 
        model.model_name.toLowerCase().includes(modelFilter.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(model => 
        statusFilter === 'healthy' ? model.status === '健康' : model.status !== '健康'
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return a.status === b.status ? 0 : a.status === '健康' ? 1 : -1;
        case 'drift':
          return a.drift_score - b.drift_score;
        case 'performance':
          return b.performance_stability - a.performance_stability;
        case 'name':
          return a.model_name.localeCompare(b.model_name);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredModels = getFilteredModels();

  // Count stats
  const healthyCount = (modelHealth || []).filter(model => model.status === '健康').length;
  const totalCount = (modelHealth || []).length;
  
  // Get selected model details
  const getSelectedModelDetails = () => {
    return filteredModels.find(model => model.model_id === selectedModel);
  };
  
  const selectedModelDetails = getSelectedModelDetails();

  return (
    <div className={`model-health-monitor ${animateEntrance ? 'page-entrance-animation' : ''}${highlight ? ' data-update-highlight' : ''}`}>
      <div className="section-header">
        <div>
          <h3 className="section-title">模型健康度监控</h3>
          <p className="section-description">
            实时监控各模型运行健康状态，确保模型预测性能稳定。
          </p>
        </div>
        <div className="health-summary-container">
          <div className="health-stat-item">
            <span className="health-stat-value healthy">{healthyCount}</span>
            <span className="health-stat-label">健康模型</span>
          </div>
          <div className="health-stat-item">
            <span className="health-stat-value attention">{totalCount - healthyCount}</span>
            <span className="health-stat-label">需关注</span>
          </div>
          <div className="health-stat-item total">
            <span className="health-stat-value">{totalCount}</span>
            <span className="health-stat-label">模型总数</span>
          </div>
        </div>
      </div>
      
      <div className="controls-container">
        <div className="filter-controls">
          <input
            type="text"
            placeholder="搜索模型..."
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="model-search-input"
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">所有状态</option>
            <option value="healthy">健康模型</option>
            <option value="warning">需关注模型</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="status">按状态排序</option>
            <option value="drift">按数据漂移排序</option>
            <option value="performance">按性能稳定性排序</option>
            <option value="name">按名称排序</option>
          </select>
        </div>
        <div className="realtime-toggle">
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={showRealTimeAlerts}
              onChange={() => setShowRealTimeAlerts(!showRealTimeAlerts)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">实时告警</span>
        </div>
      </div>
      
      {showRealTimeAlerts && (
        <div className="alerts-panel">
          <h4 className="alerts-header">实时告警 <span className="alert-count">{alerts.length}</span></h4>
          <div className="alerts-container">
            {alerts.length > 0 ? (
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.level}`}>
                    <div className="alert-time">{formatRelativeTime(alert.timestamp)}</div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-alerts">无实时告警</div>
            )}
          </div>
        </div>
      )}
      
      <div className="models-grid">
        {filteredModels.length > 0 ? filteredModels.map((model) => (
          <div 
            key={model.model_id} 
            className={`model-health-card ${model.status !== '健康' ? 'warning' : ''}`}
            onClick={(e) => handleModelDetails(model.model_id, e)}
          >
            {cardRipple.active && cardRipple.id === model.model_id && (
              <span 
                className="ripple-effect"
                style={{ left: cardRipple.x + 'px', top: cardRipple.y + 'px' }}
              ></span>
            )}
            
            <div className="model-header">
              <h4 className="model-name">{model.model_name}</h4>
              <span className={`model-status ${getStatusClass(model.status)}`}>
                {model.status}
              </span>
            </div>
            
            <div className="model-evaluation">
              <div className="last-evaluation">
                最近评估: {model.last_evaluation}
              </div>
              
              {model.alerts?.length > 0 && (
                <div className="alerts-container">
                  <div className="alert-header">
                    <span className="alert-icon">⚠️</span>
                    警告
                  </div>
                  <ul className="alerts-list">
                    {model.alerts.map((alert, idx) => (
                      <li key={idx} className="alert-item">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="health-metrics">
              <h5 className="metrics-title">健康指标</h5>
              
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">数据漂移</div>
                  <div className="metric-bar-container">
                    <div 
                      className={`metric-bar ${getMetricIndicator(model.drift_score, 'drift_score')}`}
                      style={{ width: `${model.drift_score * 100 * 3}%` }}
                    />
                  </div>
                  <div className="metric-values">
                    <span>{model.drift_score?.toFixed(2) || '0.00'}</span>
                    <span className="target-value">目标 &lt; 0.2</span>
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">性能稳定性</div>
                  <div className="metric-bar-container">
                    <div 
                      className={`metric-bar ${getMetricIndicator(model.performance_stability, 'performance_stability')}`}
                      style={{ width: `${model.performance_stability * 100}%` }}
                    />
                  </div>
                  <div className="metric-values">
                    <span>{model.performance_stability?.toFixed(2) || '0.00'}</span>
                    <span className="target-value">目标 &gt; 0.9</span>
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">错误率</div>
                  <div className="metric-bar-container">
                    <div 
                      className={`metric-bar ${getMetricIndicator(model.error_rate, 'error_rate')}`}
                      style={{ width: `${model.error_rate * 100 * 3}%` }}
                    />
                  </div>
                  <div className="metric-values">
                    <span>{model.error_rate?.toFixed(2) || '0.00'}</span>
                    <span className="target-value">目标 &lt; 0.03</span>
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">响应时间</div>
                  <div className="metric-bar-container">
                    <div 
                      className={`metric-bar ${getMetricIndicator(model.response_time, 'response_time')}`}
                      style={{ width: `${model.response_time / 3}%` }}
                    />
                  </div>
                  <div className="metric-values">
                    <span>{model.response_time}ms</span>
                    <span className="target-value">目标 &lt; 150ms</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="model-actions">
              {model.status !== '健康' && (
                <button
                  className="action-button fix-issues"
                  onClick={(e) => handleFixIssues(model.model_id, e)}
                >
                  修复问题
                </button>
              )}
              <button 
                className="action-button retrain"
                onClick={(e) => handleRetrain(model.model_id, e)}
              >
                重新训练
              </button>
            </div>
            
            <div className="view-details">
              查看详情 ▼
            </div>
          </div>
        )) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-message">没有找到匹配的模型</div>
            <button 
              className="clear-filter-button"
              onClick={() => {
                setModelFilter('');
                setStatusFilter('all');
              }}
            >
              清除筛选
            </button>
          </div>
        )}
      </div>
      
      {/* Model Details Side Panel */}
      <div className={`details-side-panel ${isDetailsPanelOpen ? 'open' : ''}`}>
        {selectedModelDetails && (
          <>
            <div className="panel-header">
              <h4 className="panel-title">{selectedModelDetails.model_name} 详细信息</h4>
              <button 
                className="panel-close"
                onClick={closeDetailsPanel}
              >
                ×
              </button>
            </div>
            
            <div className="panel-body">
              <div className="details-tabs">
                <button 
                  className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  概览
                </button>
                <button 
                  className={`tab-button ${activeTab === 'predictions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('predictions')}
                >
                  预测分析
                </button>
                <button 
                  className={`tab-button ${activeTab === 'drift' ? 'active' : ''}`}
                  onClick={() => setActiveTab('drift')}
                >
                  数据漂移
                </button>
                <button 
                  className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('logs')}
                >
                  运行日志
                </button>
              </div>
              
              <div className="details-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="details-section">
                      <h5 className="section-subtitle">模型信息</h5>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">模型ID</span>
                          <span className="info-value">{selectedModelDetails.model_id}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">版本</span>
                          <span className="info-value">{selectedModelDetails.version || '1.0'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">部署日期</span>
                          <span className="info-value">{selectedModelDetails.deployment_date || '未知'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">上次训练</span>
                          <span className="info-value">{selectedModelDetails.last_trained || '未知'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">框架</span>
                          <span className="info-value">{selectedModelDetails.framework || 'XGBoost'}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">推理节点</span>
                          <span className="info-value">{selectedModelDetails.serving_node || 'prod-01'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h5 className="section-subtitle">历史健康状况</h5>
                      <div className="health-history">
                        <div className="health-trends-chart">
                          <div className="chart-header">
                            <h6 className="chart-title">关键指标趋势</h6>
                            <div className="chart-legend">
                              <div className="legend-item">
                                <div className="legend-color drift"></div>
                                <span>数据漂移</span>
                              </div>
                              <div className="legend-item">
                                <div className="legend-color performance"></div>
                                <span>性能稳定性</span>
                              </div>
                              <div className="legend-item">
                                <div className="legend-color error"></div>
                                <span>错误率</span>
                              </div>
                            </div>
                          </div>
                          <div className="chart-container">
                            <svg className="trend-chart" viewBox="0 0 100 50" preserveAspectRatio="none">
                              {/* Generate random trend data for visualization */}
                              <path 
                                d="M0,25 L10,28 L20,23 L30,30 L40,35 L50,32 L60,25 L70,28 L80,22 L90,26 L100,30" 
                                stroke="#e6b45e" 
                                strokeWidth="2" 
                                fill="none"
                                className="trend-line drift"
                              />
                              <path 
                                d="M0,15 L10,18 L20,10 L30,12 L40,8 L50,15 L60,10 L70,12 L80,7 L90,10 L100,5" 
                                stroke="#4be1a0" 
                                strokeWidth="2" 
                                fill="none"
                                className="trend-line performance"
                              />
                              <path 
                                d="M0,35 L10,32 L20,36 L30,38 L40,34 L50,39 L60,35 L70,40 L80,36 L90,32 L100,37" 
                                stroke="#e65e5e" 
                                strokeWidth="2" 
                                fill="none"
                                className="trend-line error"
                              />
                            </svg>
                            <div className="time-labels">
                              <span>30天前</span>
                              <span>今天</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="details-section">
                      <h5 className="section-subtitle">最近健康检查</h5>
                      <div className="health-checks">
                        <table className="checks-table">
                          <thead>
                            <tr>
                              <th>检查项</th>
                              <th>结果</th>
                              <th>细节</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>输入特征一致性</td>
                              <td className={selectedModelDetails.status === '健康' ? 'check-passed' : 'check-failed'}>
                                {selectedModelDetails.status === '健康' ? '通过' : '失败'}
                              </td>
                              <td>检查模型输入特征是否与训练时保持一致</td>
                            </tr>
                            <tr>
                              <td>性能稳定性</td>
                              <td className={selectedModelDetails.performance_stability > 0.9 ? 'check-passed' : 'check-failed'}>
                                {selectedModelDetails.performance_stability > 0.9 ? '通过' : '失败'}
                              </td>
                              <td>模型性能是否随时间保持稳定</td>
                            </tr>
                            <tr>
                              <td>响应时间</td>
                              <td className={selectedModelDetails.response_time < 150 ? 'check-passed' : 'check-failed'}>
                                {selectedModelDetails.response_time < 150 ? '通过' : '失败'}
                              </td>
                              <td>模型推理时间是否满足生产要求</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                  </div>
                  </div>
                )}
                
                {activeTab === 'predictions' && (
                  <div className="predictions-tab">
                    <div className="predictions-placeholder">
                      预测分析面板（开发中）
                  </div>
                  </div>
                )}
                
                {activeTab === 'drift' && (
                  <div className="drift-tab">
                    <div className="drift-placeholder">
                      数据漂移分析面板（开发中）
                  </div>
                  </div>
                )}
                
                {activeTab === 'logs' && (
                  <div className="logs-tab">
                    <div className="logs-placeholder">
                      运行日志面板（开发中）
                </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="panel-footer">
              <button 
                className="details-button secondary"
                onClick={() => {
                  showToast('报告导出请求已提交');
                  closeDetailsPanel();
                }}
              >
                导出报告
              </button>
              <button 
                className="details-button primary"
                onClick={() => {
                  showToast('模型诊断已启动');
                  closeDetailsPanel();
                }}
              >
                诊断问题
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Backdrop for side panel */}
      {isDetailsPanelOpen && (
        <div className="panel-backdrop" onClick={closeDetailsPanel}></div>
      )}
      
      <style jsx>{`
        .model-health-monitor {
          transition: box-shadow 0.3s ease;
          position: relative;
        }
        
        .controls-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .filter-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .model-search-input,
        .status-filter,
        .sort-select {
          background-color: #15294e;
          border: 1px solid #2a3c6e;
          border-radius: 4px;
          color: #eaf6ff;
          padding: 8px 12px;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .model-search-input {
          width: 200px;
        }
        
        .model-search-input:focus,
        .status-filter:focus,
        .sort-select:focus {
          outline: none;
          border-color: #4be1a0;
          box-shadow: 0 0 0 2px rgba(75, 225, 160, 0.2);
        }
        
        .status-filter,
        .sort-select {
          cursor: pointer;
        }
        
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          color: #99b7ff;
        }
        
        .no-results-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }
        
        .no-results-message {
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        .clear-filter-button {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-filter-button:hover {
          background-color: #4be1a0;
          color: #0a1f44;
        }
        
        .realtime-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }
        
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #1e3a6d;
          transition: .4s;
          border-radius: 24px;
        }
        
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: #99b7ff;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
          background-color: #4be1a0;
        }
        
        input:checked + .toggle-slider:before {
          transform: translateX(24px);
          background-color: #eaf6ff;
        }
        
        .toggle-label {
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .alerts-panel {
          background-color: #15294e;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
          border-left: 4px solid #e6b45e;
        }
        
        .alerts-header {
          color: #eaf6ff;
          margin-top: 0;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .alert-count {
          background-color: #e6b45e;
          color: #0a1f44;
          border-radius: 12px;
          padding: 2px 8px;
          font-size: 12px;
        }
        
        .alerts-container {
          max-height: 120px;
          overflow-y: auto;
        }
        
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .alert-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 8px 12px;
          border-radius: 4px;
          background-color: rgba(30, 58, 109, 0.5);
        }
        
        .alert-item.info {
          border-left: 3px solid #4be1a0;
        }
        
        .alert-item.warning {
          border-left: 3px solid #e6b45e;
        }
        
        .alert-item.critical {
          border-left: 3px solid #e65e5e;
        }
        
        .alert-time {
          color: #99b7ff;
          font-size: 12px;
          min-width: 70px;
        }
        
        .alert-message {
          color: #eaf6ff;
          font-size: 14px;
          flex: 1;
        }
        
        .no-alerts {
          color: #99b7ff;
          text-align: center;
          padding: 12px;
        }
        
        .health-trends-chart {
          background-color: rgba(14, 27, 46, 0.5);
          border-radius: 8px;
          padding: 16px;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .chart-title {
          color: #eaf6ff;
          margin: 0;
          font-size: 14px;
        }
        
        .chart-legend {
          display: flex;
          gap: 16px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #99b7ff;
          font-size: 12px;
        }
        
        .legend-color {
          width: 16px;
          height: 3px;
          border-radius: 1px;
        }
        
        .legend-color.drift {
          background-color: #e6b45e;
        }
        
        .legend-color.performance {
          background-color: #4be1a0;
        }
        
        .legend-color.error {
          background-color: #e65e5e;
        }
        
        .chart-container {
          height: 150px;
          position: relative;
        }
        
        .trend-chart {
          width: 100%;
          height: 100%;
          background-color: rgba(10, 20, 40, 0.3);
          border-radius: 4px;
        }
        
        .trend-line {
          transition: all 0.3s ease;
        }
        
        .trend-line:hover {
          stroke-width: 3;
        }
        
        .time-labels {
          display: flex;
          justify-content: space-between;
          color: #99b7ff;
          font-size: 12px;
          margin-top: 4px;
        }
        
        .page-entrance-animation {
          animation: fadeIn 0.5s ease-out;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 20px;
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
        
        .health-summary-container {
          display: flex;
          gap: 16px;
        }
        
        .health-stat-item {
          background-color: #15294e;
          border-radius: 10px;
          padding: 16px;
          min-width: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease;
        }
        
        .health-stat-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .health-stat-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .health-stat-value.healthy {
          color: #4be1a0;
        }
        
        .health-stat-value.attention {
          color: #e6b45e;
        }
        
        .health-stat-label {
          font-size: 14px;
          color: #99b7ff;
        }
        
        .models-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 20px;
        }
        
        .model-health-card {
          background-color: #15294e;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        
        .model-health-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .model-health-card:active {
          transform: translateY(-2px);
        }
        
        .model-health-card.warning {
          border-color: #e6b45e;
        }
        
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(75, 225, 160, 0.3);
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
          width: 200px;
          height: 200px;
          margin-left: -100px;
          margin-top: -100px;
          z-index: 1;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .model-name {
          margin: 0;
          color: #eaf6ff;
        }
        
        .model-status {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .status-healthy {
          background-color: #4be1a0;
          color: #0a1f44;
        }
        
        .status-warning {
          background-color: #e6b45e;
          color: #0a1f44;
        }
        
        .model-evaluation {
          margin-bottom: 20px;
        }
        
        .last-evaluation {
          font-size: 14px;
          color: #99b7ff;
          margin-bottom: 6px;
        }
        
        .alerts-container {
          background-color: #2a3c6e;
          padding: 10px 16px;
          border-radius: 6px;
          margin-top: 12px;
          border: 1px solid #e6b45e;
        }
        
        .alert-header {
          font-weight: bold;
          margin-bottom: 4px;
          color: #e6b45e;
          display: flex;
          align-items: center;
        }
        
        .alert-icon {
          margin-right: 8px;
        }
        
        .alerts-list {
          margin: 0;
          padding-left: 20px;
        }
        
        .alert-item {
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .health-metrics {
          border-top: 1px solid #2a3c6e;
          padding-top: 16px;
          margin-bottom: 16px;
        }
        
        .metrics-title {
          margin: 0 0 12px 0;
          color: #eaf6ff;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .metric-item {
          margin-bottom: 12px;
        }
        
        .metric-label {
          font-size: 13px;
          color: #99b7ff;
          margin-bottom: 6px;
        }
        
        .metric-bar-container {
          position: relative;
          height: 8px;
          background-color: #1e3a6d;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .metric-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease-out;
        }
        
        .metric-bar.good {
          background-color: #4be1a0;
        }
        
        .metric-bar.warning {
          background-color: #e6b45e;
        }
        
        .metric-bar.critical {
          background-color: #e65e5e;
        }
        
        .metric-values {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 4px;
          color: #eaf6ff;
        }
        
        .target-value {
          color: #99b7ff;
        }
        
        .model-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .action-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .action-button.fix-issues {
          background-color: #e6b45e;
          color: #0a1f44;
        }
        
        .action-button.retrain {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:active {
          transform: translateY(0);
        }
        
        .view-details {
          text-align: center;
          color: #4be1a0;
          font-size: 14px;
          cursor: pointer;
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
        
        .panel-footer {
          padding: 16px 24px;
          border-top: 1px solid #2a3c6e;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .details-tabs {
          display: flex;
          border-bottom: 1px solid #2a3c6e;
          margin-bottom: 20px;
        }
        
        .tab-button {
          background: none;
          border: none;
          color: #99b7ff;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }
        
        .tab-button:hover {
          color: #eaf6ff;
        }
        
        .tab-button.active {
          color: #4be1a0;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #4be1a0;
        }
        
        .details-content {
          margin-bottom: 20px;
          min-height: 300px;
        }
        
        .details-section {
          margin-bottom: 24px;
        }
        
        .section-subtitle {
          color: #eaf6ff;
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #2a3c6e;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .info-label {
          font-size: 14px;
          color: #99b7ff;
        }
        
        .info-value {
          font-size: 16px;
          color: #eaf6ff;
          font-weight: bold;
        }
        
        .chart-placeholder, 
        .predictions-placeholder, 
        .drift-placeholder, 
        .logs-placeholder {
          background-color: #1e3a6d;
          border-radius: 6px;
          padding: 40px;
          text-align: center;
          color: #99b7ff;
          border: 1px dashed #2a3c6e;
        }
        
        .checks-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .checks-table th, 
        .checks-table td {
          padding: 12px;
          border: 1px solid #2a3c6e;
          text-align: left;
        }
        
        .checks-table th {
          background-color: #1e3a6d;
          color: #eaf6ff;
          font-weight: bold;
        }
        
        .checks-table td {
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .check-passed {
          color: #4be1a0;
          font-weight: bold;
        }
        
        .check-failed {
          color: #e65e5e;
          font-weight: bold;
        }
        
        .details-button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .details-button.secondary {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
        }
        
        .details-button.primary {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          font-weight: bold;
        }
        
        .details-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .details-button:active {
          transform: translateY(0);
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
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .health-summary-container {
            justify-content: space-between;
          }
          
          .models-grid {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .details-tabs {
            overflow-x: auto;
            white-space: nowrap;
            padding-bottom: 5px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelHealthMonitor; 