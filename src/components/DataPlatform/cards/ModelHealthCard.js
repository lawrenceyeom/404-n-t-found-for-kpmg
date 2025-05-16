import React from 'react';

const ModelHealthCard = ({ modelHealth }) => {
  // 选取前3个模型展示
  const displayModels = modelHealth.slice(0, 3);
  
  // 获取状态颜色
  const getStatusClass = (status) => {
    return status === '健康' ? 'success' : 'warning';
  };
  
  // 获取指标颜色
  const getMetricClass = (value, metric) => {
    if (metric === 'drift_score') {
      return value < 0.2 ? 'success' : value < 0.3 ? 'warning' : 'danger';
    } else if (metric === 'performance_stability') {
      return value > 0.9 ? 'success' : value > 0.8 ? 'warning' : 'danger';
    } else if (metric === 'error_rate') {
      return value < 0.03 ? 'success' : value < 0.05 ? 'warning' : 'danger';
    }
    return 'success';
  };
  
  // 计算健康模型和需要关注的模型数量
  const healthyCount = modelHealth.filter(model => model.status === '健康').length;
  const attentionCount = modelHealth.length - healthyCount;

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3 className="card-title">模型健康度</h3>
        <div style={{ 
          fontSize: '12px', 
          padding: '3px 8px', 
          backgroundColor: attentionCount > 0 ? 'rgba(230, 180, 94, 0.2)' : 'rgba(75, 225, 160, 0.2)', 
          color: attentionCount > 0 ? '#e6b45e' : '#4be1a0',
          borderRadius: '12px'
        }}>
          {attentionCount > 0 ? `${attentionCount}个模型需关注` : '所有模型运行正常'}
        </div>
      </div>
      
      <div className="card-content">
        {displayModels.map((model, index) => (
          <div key={index} style={{ 
            marginBottom: '16px', 
            padding: '10px', 
            backgroundColor: '#182c54', 
            borderRadius: '8px',
            border: `1px solid ${model.status === '健康' ? '#2a3c6e' : '#e6b45e'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#eaf6ff' }}>{model.model_name}</div>
              <div className={`stat-icon ${getStatusClass(model.status)}`} style={{ 
                width: 'auto', 
                height: 'auto', 
                fontSize: '12px', 
                padding: '2px 8px' 
              }}>
                {model.status}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#99b7ff', marginBottom: '4px' }}>数据漂移</div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getMetricClass(model.drift_score, 'drift_score')}`}
                    style={{ width: `${Math.min(model.drift_score * 300, 100)}%` }}
                  />
                </div>
                <div className="progress-label">
                  <span>{model.drift_score.toFixed(2)}</span>
                  <span>目标 &lt; 0.2</span>
                </div>
              </div>
              
              <div style={{ flex: 1, marginLeft: '16px' }}>
                <div style={{ fontSize: '12px', color: '#99b7ff', marginBottom: '4px' }}>性能稳定性</div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getMetricClass(model.performance_stability, 'performance_stability')}`}
                    style={{ width: `${model.performance_stability * 100}%` }}
                  />
                </div>
                <div className="progress-label">
                  <span>{model.performance_stability.toFixed(2)}</span>
                  <span>目标 &gt; 0.9</span>
                </div>
              </div>
            </div>
            
            {model.alerts.length > 0 && (
              <div style={{ 
                backgroundColor: 'rgba(230, 180, 94, 0.1)', 
                padding: '6px 10px', 
                borderRadius: '4px', 
                fontSize: '12px',
                color: '#e6b45e'
              }}>
                <span style={{ marginRight: '6px' }}>⚠️</span>
                {model.alerts[0]}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="card-footer">
        <div>已监控: {modelHealth.length}个模型</div>
        <div className="card-action">
          查看全部 &gt;
        </div>
      </div>
    </div>
  );
};

export default ModelHealthCard; 