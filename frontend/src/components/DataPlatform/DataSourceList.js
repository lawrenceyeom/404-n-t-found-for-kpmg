import React, { useState } from 'react';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const DataSourceList = ({ dataSources }) => {
  const [selectedSource, setSelectedSource] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [rippleEffect, setRippleEffect] = useState({ active: false, x: 0, y: 0, id: null });
  const highlight = useDataUpdateHighlight(dataSources);

  // Helper function to format record count
  const formatRecordCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(2) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  // Open side panel with source details
  const handleSourceDetails = (source, e) => {
    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRippleEffect({ active: true, x, y, id: source.id });
    
    // Small delay for better visual feedback before opening panel
    setTimeout(() => {
      setSelectedSource(source);
      setIsDetailsPanelOpen(true);
      setRippleEffect({ active: false, x: 0, y: 0, id: null });
    }, 300);
  };

  // Close the side panel
  const closeDetailsPanel = () => {
    setIsDetailsPanelOpen(false);
    // Add small delay before removing selected source for animation
    setTimeout(() => {
      setSelectedSource(null);
    }, 300);
  };

  // Format the last sync time as relative time
  const getRelativeTime = (timeString) => {
    if (!timeString) return '未知';
    
    const now = new Date();
    const syncTime = new Date(timeString);
    const diffMs = now - syncTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} 小时前`;
    } else {
      return `${Math.floor(diffMins / 1440)} 天前`;
    }
  };

  // Handle add new source button click
  const handleAddNewSource = () => {
    // Show a temporary toast notification instead of alert
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = '新数据源添加功能即将上线';
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

  return (
    <div className={`module-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="section-header">
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 16, color: '#eaf6ff' }}>数据源连接 ({dataSources.length})</h3>
          <p style={{ marginBottom: 20, fontSize: 14, color: '#99b7ff' }}>
            AURA平台已连接多种异构数据源，支持企业财务、运营、舆情及宏观数据的实时接入与处理。
          </p>
        </div>
        
        <button 
          className="action-button"
          onClick={handleAddNewSource}
        >
          <span style={{ marginRight: 8 }}>+</span>
          添加新数据源
        </button>
      </div>
      
      <div className="data-sources-list">
        {dataSources.map((source) => (
          <div 
            key={source.id} 
            className="data-source-card"
            onClick={(e) => handleSourceDetails(source, e)}
            style={{ cursor: 'pointer' }}
          >
            {rippleEffect.active && rippleEffect.id === source.id && (
              <span 
                className="ripple-effect"
                style={{ left: rippleEffect.x + 'px', top: rippleEffect.y + 'px' }}
              ></span>
            )}
            
            <div className="data-source-header">
              <span className="data-source-name">{source.name}</span>
              <span className={`data-source-status ${source.status === '已连接' ? 'status-connected' : 'status-configuring'}`}>
                {source.status}
              </span>
            </div>
            
            <div className="data-source-meta">
              <span>{source.type}</span>
              <span>
                {source.connection_info.api_type} / {source.connection_info.refresh_interval}
              </span>
            </div>
            
            <div className="data-source-desc">
              {source.description}
            </div>
            
            {source.record_count > 0 && (
              <div className="data-source-records">
                已收集数据: {formatRecordCount(source.record_count)} 条
              </div>
            )}
            
            {source.last_sync && (
              <div style={{ 
                fontSize: 12, 
                color: '#99b7ff', 
                marginTop: 12, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>最近同步: {source.last_sync}</span>
                <span style={{ 
                  backgroundColor: source.status === '已连接' ? '#4be1a033' : '#e6b45e33',
                  color: source.status === '已连接' ? '#4be1a0' : '#e6b45e',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11
                }}>
                  {getRelativeTime(source.last_sync)}
                </span>
              </div>
            )}

            <div className="card-hover-indicator">
              <span>查看详情</span>
            </div>
          </div>
        ))}
      </div>

      {/* 数据源详情侧边面板 */}
      <div className={`details-side-panel ${isDetailsPanelOpen ? 'open' : ''}`}>
        {selectedSource && (
          <>
            <div className="panel-header">
              <h3>{selectedSource.name}</h3>
              <button className="panel-close-btn" onClick={closeDetailsPanel}>×</button>
            </div>
            
            <div className="panel-body">
              <div className="source-details-header">
                <div className="source-type-badge">{selectedSource.type}</div>
                <div className={`source-status-badge ${selectedSource.status === '已连接' ? 'status-connected' : 'status-configuring'}`}>
                  {selectedSource.status}
                </div>
              </div>
              
              <div className="details-section">
                <h4>连接信息</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">连接类型</span>
                    <span className="detail-value">{selectedSource.connection_info.api_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">刷新间隔</span>
                    <span className="detail-value">{selectedSource.connection_info.refresh_interval}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">最近同步</span>
                    <span className="detail-value">{selectedSource.last_sync}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">数据量</span>
                    <span className="detail-value">{formatRecordCount(selectedSource.record_count)} 条记录</span>
                  </div>
                </div>
              </div>
              
              <div className="details-section">
                <h4>数据源描述</h4>
                <p className="source-description">{selectedSource.description}</p>
              </div>
              
              <div className="details-section">
                <h4>数据示例</h4>
                <div className="data-sample-table">
                  <table>
                    <thead>
                      <tr>
                        <th>字段名称</th>
                        <th>数据类型</th>
                        <th>样例值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSource.sample_fields?.map((field, index) => (
                        <tr key={index}>
                          <td>{field.name}</td>
                          <td>{field.type}</td>
                          <td>{field.sample}</td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center' }}>暂无数据</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="panel-actions">
                <button 
                  className="primary-button"
                  onClick={() => {
                    closeDetailsPanel();
                    // Show a toast notification instead of alert
                    const toast = document.createElement('div');
                    toast.className = 'toast-notification';
                    toast.textContent = `即将配置数据源: ${selectedSource.name}`;
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
                  }}
                >
                  配置数据源
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 点击外部区域关闭侧边面板 */}
      {isDetailsPanelOpen && (
        <div className="panel-backdrop" onClick={closeDetailsPanel}></div>
      )}
      
      <style jsx>{`
        .module-container {
          transition: box-shadow 0.3s ease;
          position: relative;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        .action-button {
          background: linear-gradient(90deg, #1e3a6d 0%, #2a4d8d 100%);
          border: none;
          color: #eaf6ff;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        .action-button:hover {
          background: linear-gradient(90deg, #2a4d8d 0%, #3a5d9d 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .action-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .data-source-card {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .data-source-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          border-color: #4be1a0;
        }
        
        .data-source-card:active {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .card-hover-indicator {
          position: absolute;
          bottom: -30px;
          left: 0;
          right: 0;
          background: #4be1a0;
          color: #0a1f44;
          text-align: center;
          padding: 6px;
          font-weight: bold;
          transition: bottom 0.3s ease;
        }
        
        .data-source-card:hover .card-hover-indicator {
          bottom: 0;
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
        
        .panel-header h3 {
          margin: 0;
          color: #4be1a0;
        }
        
        .panel-close-btn {
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
        
        .panel-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .panel-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }
        
        .source-details-header {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .source-type-badge {
          background-color: #1e3a6d;
          color: #eaf6ff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .source-status-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .status-connected {
          background-color: rgba(75, 225, 160, 0.2);
          color: #4be1a0;
        }
        
        .status-configuring {
          background-color: rgba(230, 180, 94, 0.2);
          color: #e6b45e;
        }
        
        .details-section {
          margin-bottom: 24px;
        }
        
        .details-section h4 {
          color: #eaf6ff;
          margin-top: 0;
          margin-bottom: 16px;
          border-bottom: 1px solid #2a3c6e;
          padding-bottom: 8px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .detail-label {
          font-size: 13px;
          color: #99b7ff;
        }
        
        .detail-value {
          font-size: 16px;
          color: #eaf6ff;
        }
        
        .source-description {
          color: #eaf6ff;
          line-height: 1.6;
        }
        
        .data-sample-table {
          overflow-x: auto;
        }
        
        .data-sample-table table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-sample-table th,
        .data-sample-table td {
          padding: 10px;
          border: 1px solid #2a3c6e;
          text-align: left;
        }
        
        .data-sample-table th {
          background-color: #1e3a6d;
        }
        
        .data-sample-table tr:nth-child(even) {
          background-color: #15294e;
        }
        
        .panel-actions {
          padding-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        
        .primary-button {
          background-color: #4be1a0;
          color: #0a1f44;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }
        
        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(75, 225, 160, 0.3);
        }
        
        .primary-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(75, 225, 160, 0.3);
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
      `}</style>
    </div>
  );
};

export default DataSourceList; 