import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const FeatureEngineering = ({ featureMetrics }) => {
  const [pipelineStatus, setPipelineStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [cardRipple, setCardRipple] = useState({ active: false, x: 0, y: 0, id: null });
  const highlight = useDataUpdateHighlight(featureMetrics);

  useEffect(() => {
    const fetchPipelineStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/platform/processing-pipeline-status`);
        const data = await response.json();
        setPipelineStatus(data);
      } catch (error) {
        console.error('Error fetching pipeline status:', error);
        setPipelineStatus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelineStatus();
  }, []);

  // 判空处理
  const safeFeatureMetrics = Array.isArray(featureMetrics) ? featureMetrics : [];

  // Get total features count
  const getTotalFeatures = () => {
    return safeFeatureMetrics.reduce((acc, category) => acc + category['特征数量'], 0);
  };

  // Get average automation rate
  const getAverageAutomationRate = () => {
    if (safeFeatureMetrics.length === 0) return 0;
    const totalRate = safeFeatureMetrics.reduce((acc, category) => acc + category['自动化率'], 0);
    return totalRate / safeFeatureMetrics.length;
  };

  // Filter feature categories based on search term
  const getFilteredCategories = () => {
    if (!searchTerm.trim()) return safeFeatureMetrics;
    
    return safeFeatureMetrics.filter(category => 
      category['类别'].toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category['特征列表'] && category['特征列表'].some(feature => 
        feature.名称.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  };
  
  // Toggle category expansion
  const toggleCategoryExpansion = (categoryIndex) => {
    setExpandedCategory(expandedCategory === categoryIndex ? null : categoryIndex);
  };
  
  // Open feature details
  const openFeatureDetails = (feature, categoryName, e) => {
    if (e) {
      // 创建点击效果
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = feature.名称; // 使用特征名称作为id
      
      setCardRipple({ active: true, x, y, id });
      
      // 延迟一点时间后显示面板，增强视觉反馈
      setTimeout(() => {
        setSelectedFeature({ ...feature, 类别: categoryName });
        setIsDetailsPanelOpen(true);
        setCardRipple({ active: false, x: 0, y: 0, id: null });
      }, 300);
    } else {
      setSelectedFeature({ ...feature, 类别: categoryName });
      setIsDetailsPanelOpen(true);
    }
  };
  
  // Close feature details
  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    // 延时清除选中的特征，等待动画完成
    setTimeout(() => setSelectedFeature(null), 300);
  };

  // 显示轻量级提示通知
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

  const filteredCategories = getFilteredCategories();

  return (
    <div className={`feature-engineering-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="section-header">
    <div>
      <h3 style={{ marginTop: 0, marginBottom: 16, color: '#eaf6ff' }}>特征工程平台</h3>
      <p style={{ marginBottom: 20, fontSize: 14, color: '#99b7ff' }}>
        特征自动化生成与管理，为AI模型提供高质量特征输入。
      </p>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索特征..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="new-feature-button">
            <span>+</span> 创建特征
          </button>
          </div>
          </div>
      
      <div className="feature-summary">
        <div className="summary-card">
          <div className="summary-value">{getTotalFeatures()}</div>
          <div className="summary-label">特征总数</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">{getAverageAutomationRate().toFixed(1)}%</div>
          <div className="summary-label">平均自动化率</div>
          </div>
        
        <div className="summary-card">
          <div className="summary-value">{safeFeatureMetrics.length}</div>
          <div className="summary-label">特征类别</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value" style={{ color: '#5e9de6' }}>{pipelineStatus.filter(p => p.status === '运行中').length}</div>
          <div className="summary-label">活跃流水线</div>
        </div>
      </div>
      
      <div className="categories-container">
        <h4 className="section-title">特征类别分布</h4>
        
        {filteredCategories.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <p>未找到匹配的特征或类别</p>
            <button className="clear-search" onClick={() => setSearchTerm('')}>清除搜索</button>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category, index) => (
            <div 
              key={index} 
                className={`category-card ${expandedCategory === index ? 'expanded' : ''}`}
                onClick={() => toggleCategoryExpansion(index)}
              >
                <div className="category-header">
                  <h5 className="category-title">{category['类别']}</h5>
                  <div className="category-badge">{category['特征数量']} 特征</div>
                </div>
                
                <div className="category-metrics">
                  <div className="metric-item">
                    <div className="metric-label">自动化率</div>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${category['自动化率']}%` }}
                      ></div>
                    </div>
                    <div className="metric-value">{category['自动化率']}%</div>
                  </div>
                </div>
                
                <div className="category-footer">
                  <div className="update-info">最近更新: {category['最近更新']}</div>
                  <div className="expand-indicator">
                    {expandedCategory === index ? '收起' : '展开'} 
                    <span className={`arrow ${expandedCategory === index ? 'up' : 'down'}`}>
                      {expandedCategory === index ? '▲' : '▼'}
                </span>
              </div>
                </div>
                
                {expandedCategory === index && category['特征列表'] && (
                  <div className="features-list">
                    <div className="features-header">
                      <div className="feature-col name">特征名称</div>
                      <div className="feature-col type">类型</div>
                      <div className="feature-col importance">重要性</div>
                      <div className="feature-col actions">操作</div>
                    </div>
                    {category['特征列表'].map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="feature-row"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFeatureDetails(feature, category['类别'], e);
                        }}
                      >
                        {cardRipple.active && cardRipple.id === feature.名称 && (
                          <span 
                            className="ripple-effect"
                            style={{ left: cardRipple.x + 'px', top: cardRipple.y + 'px' }}
                          ></span>
                        )}
                        <div className="feature-col name">
                          {feature.名称}
                          {feature.自动生成 && <span className="auto-badge">自动</span>}
                        </div>
                        <div className="feature-col type">{feature.类型}</div>
                        <div className="feature-col importance">
                          <div className="importance-bar-container">
                            <div 
                              className="importance-bar"
                              style={{ width: `${feature.重要性 * 100}%` }}
                  ></div>
                </div>
                          <span className="importance-value">{(feature.重要性 * 100).toFixed(1)}%</span>
              </div>
                        <div className="feature-col actions">
                          <button 
                            className="feature-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFeatureDetails(feature, category['类别'], e);
                            }}
                          >
                            详情
                          </button>
              </div>
            </div>
          ))}
        </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="pipeline-container">
        <h4 className="section-title">数据处理流水线状态</h4>
        
        {loading ? (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>加载流水线状态...</p>
          </div>
        ) : (
          <div className="pipeline-grid">
              {pipelineStatus.map((pipeline, index) => (
                <div 
                  key={index} 
                className={`pipeline-card ${pipeline.status === '运行中' ? 'active' : 'inactive'}`}
              >
                <div className="pipeline-header">
                  <h5 className="pipeline-title">{pipeline.name}</h5>
                  <div className={`pipeline-status ${pipeline.status === '运行中' ? 'status-running' : 'status-paused'}`}>
                      {pipeline.status}
                  </div>
                  </div>
                  
                <div className="pipeline-details">
                  <div className="detail-item">
                    <span className="detail-label">类型</span>
                    <span className="detail-value">{pipeline.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">处理能力</span>
                    <span className="detail-value">{pipeline.capacity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">最近运行</span>
                    <span className="detail-value">{pipeline.last_run}</span>
                  </div>
                    </div>
                
                <div className="pipeline-metrics">
                  <div className="metric-item">
                    <div className="metric-label">处理效率</div>
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${pipeline.efficiency}%`,
                          backgroundColor: pipeline.efficiency > 85 ? '#4be1a0' : '#e6b45e'
                        }}
                      ></div>
                    </div>
                    <div className="metric-value">{pipeline.efficiency}%</div>
                    </div>
                  </div>
                  
                <div className="pipeline-actions">
                  <button className="pipeline-btn view" onClick={() => showToast('查看详情功能即将上线')}>查看详情</button>
                  {pipeline.status === '运行中' ? (
                    <button className="pipeline-btn pause" onClick={() => showToast(`已暂停流水线: ${pipeline.name}`)}>暂停</button>
                  ) : (
                    <button className="pipeline-btn start" onClick={() => showToast(`已启动流水线: ${pipeline.name}`)}>启动</button>
                  )}
                      </div>
                    </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Feature Details Side Panel */}
      <div className={`details-side-panel ${isDetailsPanelOpen ? 'open' : ''}`}>
        {selectedFeature && (
          <>
            <div className="panel-header">
              <h3 className="panel-title">特征详情</h3>
              <button className="panel-close" onClick={closeDetailsPanel}>×</button>
            </div>
            
            <div className="panel-body">
              <div className="feature-header">
                <div className="feature-title">{selectedFeature.名称}</div>
                <div className="feature-badges">
                  <span className="feature-category-badge">{selectedFeature.类别}</span>
                  {selectedFeature.自动生成 && <span className="feature-auto-badge">自动生成</span>}
                      </div>
                    </div>
              
              <div className="feature-meta">
                <div className="meta-item">
                  <span className="meta-label">类型</span>
                  <span className="meta-value">{selectedFeature.类型}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">重要性</span>
                  <span className="meta-value importance">
                    {(selectedFeature.重要性 * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">创建时间</span>
                  <span className="meta-value">{selectedFeature.创建时间 || '未知'}</span>
                      </div>
                    </div>
              
              <div className="feature-description">
                <h4>特征描述</h4>
                <p>{selectedFeature.描述 || '暂无描述'}</p>
                      </div>
              
              <div className="feature-usage">
                <h4>使用情况</h4>
                <div className="usage-models">
                  <h5>关联模型</h5>
                  <ul className="models-list">
                    {selectedFeature.关联模型 ? (
                      selectedFeature.关联模型.map((model, idx) => (
                        <li key={idx} className="model-item">
                          <span className="model-name">{model.名称}</span>
                          <span className="model-importance">{model.重要性}</span>
                        </li>
                      ))
                    ) : (
                      <li className="no-models">暂未关联模型</li>
                    )}
                  </ul>
                    </div>
                  </div>
              
              <div className="feature-formula">
                <h4>计算公式</h4>
                <div className="formula-container">
                  <pre className="formula-code">{selectedFeature.计算公式 || '暂无公式'}</pre>
                </div>
              </div>
            </div>
            
            <div className="panel-footer">
              <button className="panel-btn primary" onClick={() => {
                closeDetailsPanel();
                showToast(`即将编辑特征: ${selectedFeature.名称}`);
              }}>编辑特征</button>
          </div>
          </>
        )}
      </div>
      
      {/* Backdrop to close panel when clicking outside */}
      {isDetailsPanelOpen && (
        <div className="panel-backdrop" onClick={closeDetailsPanel}></div>
      )}
      
      <style jsx>{`
        .feature-engineering-container {
          transition: box-shadow 0.3s ease;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .search-container {
          display: flex;
          gap: 12px;
        }
        
        .search-input {
          background-color: #1e3a6d;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 12px;
          color: #eaf6ff;
          min-width: 200px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #4be1a0;
          box-shadow: 0 0 0 1px #4be1a0;
        }
        
        .search-input::placeholder {
          color: #99b7ff;
        }
        
        .new-feature-button {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        
        .new-feature-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
        }
        
        .feature-summary {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .summary-card {
          background-color: #15294e;
          border-radius: 10px;
          padding: 16px;
          flex: 1 1 160px;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .summary-value {
          font-size: 32px;
          font-weight: bold;
          color: #4be1a0;
          margin-bottom: 8px;
        }
        
        .summary-label {
          font-size: 14px;
          color: #99b7ff;
        }
        
        .section-title {
          color: #eaf6ff;
          margin: 0 0 16px 0;
          font-size: 18px;
        }
        
        .categories-container, .pipeline-container {
          background-color: #15294e;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #2a3c6e;
        }
        
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          color: #99b7ff;
        }
        
        .no-results-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .no-results p {
          margin-bottom: 16px;
        }
        
        .clear-search {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .clear-search:hover {
          background-color: #2a4d8d;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .category-card {
          background-color: #1e3a6d;
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid #2a3c6e;
        }
        
        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .category-card.expanded {
          grid-column: 1 / -1;
        }
        
        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .category-title {
          margin: 0;
          color: #eaf6ff;
          font-size: 18px;
        }
        
        .category-badge {
          background-color: #15294e;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 14px;
          color: #99b7ff;
        }
        
        .category-metrics {
          margin-bottom: 12px;
        }
        
        .metric-item {
          margin-bottom: 8px;
        }
        
        .metric-label {
          font-size: 14px;
          color: #99b7ff;
          margin-bottom: 6px;
        }
        
        .progress-container {
          height: 8px;
          background-color: #152642;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #4be1a0;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .metric-value {
          font-size: 14px;
          color: #eaf6ff;
          text-align: right;
        }
        
        .category-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        
        .update-info {
          color: #99b7ff;
        }
        
        .expand-indicator {
          color: #4be1a0;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .arrow {
          font-size: 10px;
          transition: transform 0.3s ease;
        }
        
        .features-list {
          margin-top: 16px;
          border-top: 1px solid #2a3c6e;
          padding-top: 16px;
        }
        
        .features-header {
          display: flex;
          font-weight: bold;
          color: #eaf6ff;
          margin-bottom: 8px;
          padding: 0 8px 8px;
          border-bottom: 1px solid #2a3c6e;
        }
        
        .feature-row {
          display: flex;
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 4px;
          transition: background-color 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .feature-row:hover {
          background-color: #15294e;
        }
        
        .feature-row:active {
          background-color: #1a304d;
        }
        
        .feature-col {
          padding: 0 8px;
        }
        
        .feature-col.name {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .feature-col.type {
          flex: 1;
        }
        
        .feature-col.importance {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .feature-col.actions {
          flex: 1;
          text-align: right;
        }
        
        .auto-badge {
          background-color: #5e9de6;
          color: #0a1f44;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: bold;
        }
        
        .importance-bar-container {
          height: 6px;
          background-color: #152642;
          border-radius: 3px;
          overflow: hidden;
          flex: 1;
        }
        
        .importance-bar {
          height: 100%;
          background-color: #4be1a0;
          border-radius: 3px;
        }
        
        .importance-value {
          font-size: 13px;
          color: #4be1a0;
          min-width: 45px;
          text-align: right;
        }
        
        .feature-action-btn {
          background-color: #15294e;
          color: #4be1a0;
          border: 1px solid #4be1a0;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .feature-action-btn:hover {
          background-color: #4be1a0;
          color: #0a1f44;
        }
        
        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .pipeline-card {
          background-color: #1e3a6d;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .pipeline-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .pipeline-card.active {
          border-color: #4be1a0;
        }
        
        .pipeline-card.inactive {
          border-color: #e6b45e;
          opacity: 0.8;
        }
        
        .pipeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .pipeline-title {
          margin: 0;
          color: #eaf6ff;
          font-size: 18px;
        }
        
        .pipeline-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-running {
          background-color: #4be1a0;
          color: #0a1f44;
        }
        
        .status-paused {
          background-color: #e6b45e;
          color: #0a1f44;
        }
        
        .pipeline-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .detail-label {
          font-size: 12px;
          color: #99b7ff;
        }
        
        .detail-value {
          font-size: 14px;
          color: #eaf6ff;
        }
        
        .pipeline-metrics {
          margin-bottom: 16px;
        }
        
        .pipeline-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        
        .pipeline-btn {
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pipeline-btn.view {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
        }
        
        .pipeline-btn.pause {
          background-color: #e6b45e;
          color: #0a1f44;
          border: none;
        }
        
        .pipeline-btn.start {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
        }
        
        .pipeline-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .loading-section {
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
        
        .details-side-panel {
          position: fixed;
          top: 0;
          right: -450px;
          width: 450px;
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
        }
        
        .panel-btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .panel-btn.primary {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          font-weight: bold;
        }
        
        .panel-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
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
        
        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .search-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default FeatureEngineering; 