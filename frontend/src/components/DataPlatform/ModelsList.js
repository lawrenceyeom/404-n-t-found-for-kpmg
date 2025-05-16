import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../constants';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const ModelsList = ({ models }) => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [cardRipple, setCardRipple] = useState({ active: false, x: 0, y: 0, id: null });
  const highlight = useDataUpdateHighlight(models);

  const handleModelSelect = async (modelId, e) => {
    if (isCompareMode) {
      // In compare mode, toggle selection with ripple effect
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setCardRipple({ active: true, x, y, id: modelId });
        
        setTimeout(() => {
          if (selectedModels.includes(modelId)) {
            setSelectedModels(selectedModels.filter(id => id !== modelId));
          } else if (selectedModels.length < 3) { // Limit to 3 models for comparison
            setSelectedModels([...selectedModels, modelId]);
          } else {
            showToast('最多可选择3个模型进行比较');
          }
          setCardRipple({ active: false, x: 0, y: 0, id: null });
        }, 300);
      } else {
        if (selectedModels.includes(modelId)) {
          setSelectedModels(selectedModels.filter(id => id !== modelId));
        } else if (selectedModels.length < 3) {
          setSelectedModels([...selectedModels, modelId]);
        } else {
          showToast('最多可选择3个模型进行比较');
        }
      }
    } else {
      // Normal mode, open model details with animation
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setCardRipple({ active: true, x, y, id: modelId });
      }
      
      setDetailsLoading(true);
    setSelectedModel(models.find(m => m.id === modelId));
      setIsDetailsPanelOpen(true);

    try {
      const response = await fetch(`${API_BASE}/platform/feature-importance/${modelId}`);
      const data = await response.json();
      setFeatureImportance(data);
    } catch (error) {
      console.error('Error fetching feature importance:', error);
      setFeatureImportance([]);
    } finally {
        setDetailsLoading(false);
        setCardRipple({ active: false, x: 0, y: 0, id: null });
      }
    }
  };

  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    setTimeout(() => {
    setSelectedModel(null);
    setFeatureImportance([]);
    }, 300);
  };

  const toggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    setSelectedModels([]);
  };

  const clearSelection = () => {
    setSelectedModels([]);
  };

  const handleCompare = () => {
    if (selectedModels.length < 2) {
      showToast('请至少选择两个模型进行比较');
      return;
    }
    
    // Show toast notification instead of alert
    showToast(`即将比较 ${selectedModels.length} 个模型`);
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

  // Filter models based on type
  const filteredModels = filterType === 'all' 
    ? models 
    : models.filter(model => model.type === filterType);

  // Get unique model types for filter
  const modelTypes = ['all', ...new Set(models.map(model => model.type))];

  // Sort models based on selected criteria
  const sortedModels = [...filteredModels].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'accuracy':
        comparison = a.accuracy - b.accuracy;
        break;
      case 'date':
        comparison = new Date(a.created_at) - new Date(b.created_at);
        break;
      default: // 'name'
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Toggle sort direction when clicking on the same sort option
  const handleSortChange = (option) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  return (
    <div className={`models-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="header-section">
    <div>
          <h3 className="section-title">AI模型管理</h3>
          <p className="section-description">
        AURA平台已部署多种AI模型，为审计风险监控提供多维度智能分析。
      </p>
        </div>
        
        <div className="actions-section">
          <button 
            className={`compare-button ${isCompareMode ? 'active' : ''}`}
            onClick={toggleCompareMode}
          >
            {isCompareMode ? '退出比较模式' : '比较模型'}
          </button>
          
          <button 
            className="new-model-button"
            onClick={() => showToast('创建新模型功能即将上线')}
          >
            + 创建新模型
          </button>
        </div>
      </div>
      
      {isCompareMode && (
        <div className="compare-panel">
          <div className="compare-info">
            <span className="selection-count">已选择 {selectedModels.length}/3 个模型</span>
            <div className="selection-models">
              {selectedModels.map(modelId => {
                const model = models.find(m => m.id === modelId);
                return (
                  <div key={modelId} className="selected-model-chip">
                    <span>{model.name}</span>
                    <button 
                      className="remove-selection"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModels(selectedModels.filter(id => id !== modelId));
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="compare-actions">
            <button 
              className="clear-button"
              onClick={clearSelection}
              disabled={selectedModels.length === 0}
            >
              清除选择
            </button>
            <button 
              className="compare-button-action"
              onClick={handleCompare}
              disabled={selectedModels.length < 2}
            >
              比较所选模型
            </button>
          </div>
        </div>
      )}
      
      <div className="filters-section">
        <div className="filter-group">
          <label>模型类型：</label>
          <div className="filter-options">
            {modelTypes.map(type => (
              <button
                key={type}
                className={`filter-option ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? '全部' : type}
              </button>
            ))}
          </div>
        </div>
        
        <div className="sort-group">
          <label>排序：</label>
          <div className="sort-options">
            <button 
              className={`sort-option ${sortBy === 'name' ? 'active' : ''}`}
              onClick={() => handleSortChange('name')}
            >
              名称
              {sortBy === 'name' && (
                <span className="sort-direction">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button 
              className={`sort-option ${sortBy === 'accuracy' ? 'active' : ''}`}
              onClick={() => handleSortChange('accuracy')}
            >
              准确率
              {sortBy === 'accuracy' && (
                <span className="sort-direction">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
            <button 
              className={`sort-option ${sortBy === 'date' ? 'active' : ''}`}
              onClick={() => handleSortChange('date')}
            >
              创建日期
              {sortBy === 'date' && (
                <span className="sort-direction">
                  {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="models-grid">
        {sortedModels.map((model) => (
          <div 
            key={model.id} 
            className={`model-card ${isCompareMode && selectedModels.includes(model.id) ? 'selected' : ''}`}
            onClick={(e) => handleModelSelect(model.id, e)}
          >
            {cardRipple.active && cardRipple.id === model.id && (
              <span 
                className="ripple-effect"
                style={{ left: cardRipple.x + 'px', top: cardRipple.y + 'px' }}
              ></span>
            )}
            
            {isCompareMode && (
              <div className="select-indicator">
                <div className={`checkbox ${selectedModels.includes(model.id) ? 'checked' : ''}`}>
                  {selectedModels.includes(model.id) && <span>✓</span>}
                </div>
              </div>
            )}
            
            <div className="model-header">
              <div className="model-name-section">
              <span className="model-name">{model.name}</span>
                <span className="model-version">v{model.version}</span>
              </div>
              <span className="model-type">{model.type}</span>
            </div>

            <div className="model-accuracy">
              <div className="accuracy-label">准确率</div>
              <div className="accuracy-bar-container">
                <div 
                  className="accuracy-bar" 
                  style={{ width: `${model.accuracy * 100}%` }}
                ></div>
              </div>
              <div className="accuracy-value">{(model.accuracy * 100).toFixed(1)}%</div>
            </div>

            <span className={`model-status ${model.status === '运行中' ? 'status-deployed' : 'status-training'}`}>
              {model.status}
            </span>

            <div className="model-details">
              <div className="model-detail-item">
                <span className="model-detail-label">框架：</span>
                <span className="model-detail-value">{model.framework}</span>
              </div>
              <div className="model-detail-item">
                <span className="model-detail-label">特征数量：</span>
                <span className="model-detail-value">{model.features_count || '未知'}</span>
              </div>
              <div className="model-detail-item">
                <span className="model-detail-label">创建日期：</span>
                <span className="model-detail-value">{model.created_at}</span>
              </div>
              <div className="model-detail-item">
                <span className="model-detail-label">最近训练：</span>
                <span className="model-detail-value">{model.last_trained || '未训练'}</span>
              </div>
            </div>

            <div className="model-description">
              {model.description}
            </div>

            {!isCompareMode && (
            <button
              className="view-details-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleModelSelect(model.id, e);
                }}
              disabled={model.status === '训练中'}
            >
              查看模型详情
            </button>
            )}
          </div>
        ))}
      </div>

      {/* Model Details Side Panel */}
      <div className={`details-side-panel ${isDetailsPanelOpen ? 'open' : ''}`}>
        {selectedModel && (
          <>
            <div className="panel-header">
              <div className="panel-title-section">
                <h3 className="panel-title">{selectedModel.name}</h3>
                <span className="panel-version">v{selectedModel.version}</span>
              </div>
              <button className="panel-close" onClick={closeDetailsPanel}>×</button>
            </div>

            <div className="panel-body">
              <div className="model-badge-section">
                <div className="model-badge">{selectedModel.type}</div>
                <div className="model-badge">{selectedModel.framework}</div>
                <div className={`model-badge ${selectedModel.status === '运行中' ? 'status-deployed' : 'status-training'}`}>
                  {selectedModel.status}
                </div>
              </div>

              <div className="model-meta-section">
                <div className="model-meta-item">
                  <span className="meta-label">准确率</span>
                  <span className="meta-value accuracy">{(selectedModel.accuracy * 100).toFixed(1)}%</span>
                </div>
                <div className="model-meta-item">
                  <span className="meta-label">创建日期</span>
                  <span className="meta-value">{selectedModel.created_at}</span>
                </div>
                <div className="model-meta-item">
                  <span className="meta-label">作者</span>
                  <span className="meta-value">{selectedModel.author}</span>
                </div>
                <div className="model-meta-item">
                  <span className="meta-label">最近训练</span>
                  <span className="meta-value">{selectedModel.last_trained || '未训练'}</span>
              </div>
            </div>

              <div className="model-description-section">
                <h4>模型描述</h4>
                <p>{selectedModel.description}</p>
            </div>

              {detailsLoading ? (
                <div className="panel-loading">
                  <div className="loading-spinner"></div>
                <p>加载特征重要性...</p>
              </div>
            ) : (
              <>
                  <div className="model-features-section">
                    <h4>特征重要性分析</h4>
                  {featureImportance.length > 0 ? (
                      <div className="features-chart">
                        {featureImportance.slice(0, 10).map((feature, index) => (
                          <div key={index} className="feature-bar-item">
                            <div className="feature-name" title={feature.特征名}>
                              {feature.特征名}
                            </div>
                            <div className="feature-bar-container">
                              <div 
                                className="feature-bar" 
                                style={{ width: `${feature.重要性 * 100}%` }}
                              ></div>
                            </div>
                            <div className="feature-value">{(feature.重要性 * 100).toFixed(1)}%</div>
                                </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data-message">未找到特征重要性数据</p>
                    )}
                  </div>

                  <div className="model-metrics-section">
                    <h4>性能指标</h4>
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-value">
                          {(selectedModel.accuracy * 100).toFixed(1)}%
                        </div>
                        <div className="metric-label">准确率</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">
                          {(selectedModel.precision || 0.85).toFixed(2)}
                        </div>
                        <div className="metric-label">精确率</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">
                          {(selectedModel.recall || 0.82).toFixed(2)}
                        </div>
                        <div className="metric-label">召回率</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">
                          {(selectedModel.f1_score || 0.83).toFixed(2)}
                        </div>
                        <div className="metric-label">F1得分</div>
                      </div>
                    </div>
                  </div>
                </>
                  )}
                </div>

            <div className="panel-footer">
                  <button
                className="primary-button"
                onClick={() => {
                  closeDetailsPanel();
                  showToast(`即将${selectedModel.status === '运行中' ? '管理' : '部署'}模型: ${selectedModel.name}`);
                }}
              >
                {selectedModel.status === '运行中' ? '管理模型' : '部署模型'}
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
        .models-container {
          transition: box-shadow 0.3s ease;
          position: relative;
        }
        
        .header-section {
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
          margin-bottom: 20px;
          font-size: 14px;
          color: #99b7ff;
        }
        
        .actions-section {
          display: flex;
          gap: 12px;
        }
        
        .compare-button {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .compare-button:hover {
          background-color: #2a4d8d;
        }
        
        .compare-button.active {
          background-color: #4be1a0;
          color: #0a1f44;
          border-color: #4be1a0;
        }
        
        .new-model-button {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .new-model-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
        }
        
        .compare-panel {
          background-color: #1e3a6d;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #2a3c6e;
        }
        
        .compare-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .selection-count {
          font-size: 14px;
          color: #eaf6ff;
          font-weight: bold;
        }
        
        .selection-models {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .selected-model-chip {
          background-color: #15294e;
          border-radius: 16px;
          padding: 4px 12px;
          font-size: 12px;
          color: #eaf6ff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .remove-selection {
          background: none;
          border: none;
          color: #eaf6ff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          padding: 0;
          font-size: 14px;
        }
        
        .remove-selection:hover {
          background-color: rgba(234, 246, 255, 0.2);
        }
        
        .compare-actions {
          display: flex;
          gap: 12px;
        }
        
        .clear-button {
          background-color: transparent;
          color: #99b7ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .compare-button-action {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        }
        
        .compare-button-action:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .filters-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .filter-group, .sort-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .filter-group label, .sort-group label {
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .filter-options, .sort-options {
          display: flex;
          gap: 8px;
        }
        
        .filter-option, .sort-option {
          background-color: #1e3a6d;
          color: #99b7ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .filter-option:hover, .sort-option:hover {
          background-color: #2a4d8d;
          color: #eaf6ff;
        }
        
        .filter-option.active, .sort-option.active {
          background-color: #4be1a0;
          color: #0a1f44;
          border-color: #4be1a0;
        }
        
        .sort-direction {
          margin-left: 4px;
        }
        
        .models-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .model-card {
          background-color: #15294e;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          position: relative;
          border: 1px solid #2a3c6e;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .model-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          border-color: #4be1a0;
        }
        
        .model-card:active {
          transform: translateY(-2px);
        }
        
        .model-card.selected {
          border-color: #4be1a0;
          box-shadow: 0 0 0 1px #4be1a0, 0 8px 24px rgba(75, 225, 160, 0.2);
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
        
        .select-indicator {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 2;
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 2px solid #2a3c6e;
          background-color: #1e3a6d;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0a1f44;
          transition: all 0.2s ease;
        }
        
        .checkbox.checked {
          background-color: #4be1a0;
          border-color: #4be1a0;
        }
        
        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        
        .model-name-section {
          display: flex;
          flex-direction: column;
        }
        
        .model-name {
          font-weight: bold;
          color: #eaf6ff;
          font-size: 18px;
          margin-bottom: 4px;
        }
        
        .model-version {
          color: #99b7ff;
          font-size: 14px;
        }
        
        .model-type {
          padding: 4px 10px;
          background-color: #1e3a6d;
          border-radius: 16px;
          font-size: 12px;
          color: #99b7ff;
        }
        
        .model-accuracy {
          margin-bottom: 16px;
        }
        
        .accuracy-label {
          font-size: 14px;
          color: #99b7ff;
          margin-bottom: 6px;
        }
        
        .accuracy-bar-container {
          height: 8px;
          background-color: #1e3a6d;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        
        .accuracy-bar {
          height: 100%;
          background-color: #4be1a0;
          border-radius: 4px;
        }
        
        .accuracy-value {
          text-align: right;
          color: #4be1a0;
          font-size: 14px;
          font-weight: bold;
        }
        
        .model-status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          margin-bottom: 16px;
        }
        
        .status-deployed {
          background-color: #4be1a0;
          color: #0a1f44;
        }
        
        .status-training {
          background-color: #e6b45e;
          color: #0a1f44;
        }
        
        .model-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .model-detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .model-detail-label {
          color: #99b7ff;
          font-size: 12px;
        }
        
        .model-detail-value {
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .model-description {
          color: #eaf6ff;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
          height: 60px;
          overflow: hidden;
          position: relative;
        }
        
        .model-description::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 20px;
          background: linear-gradient(to bottom, rgba(21, 41, 78, 0), #15294e);
        }
        
        .view-details-btn {
          width: 100%;
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 8px 0;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .view-details-btn:hover {
          background-color: #2a4d8d;
        }
        
        .view-details-btn:active {
          background-color: #243d6b;
        }
        
        .view-details-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          padding: 20px 24px;
          border-bottom: 1px solid #2a3c6e;
        }
        
        .panel-title-section {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        
        .panel-title {
          margin: 0;
          color: #4be1a0;
          font-size: 22px;
        }
        
        .panel-version {
          color: #99b7ff;
          font-size: 16px;
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
        
        .panel-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          color: #99b7ff;
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
        
        .panel-footer {
          padding: 16px 24px;
          border-top: 1px solid #2a3c6e;
          display: flex;
          justify-content: flex-end;
        }
        
        .primary-button {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
        }
        
        .primary-button:active {
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
          .header-section,
          .filters-section,
          .compare-panel {
            flex-direction: column;
            align-items: stretch;
          }
          
          .actions-section {
            justify-content: space-between;
          }
          
          .compare-panel {
            gap: 16px;
          }
          
          .compare-actions {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default ModelsList; 