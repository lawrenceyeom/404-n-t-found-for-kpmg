import React, { useState, useEffect } from 'react';
import { useDataUpdateHighlight } from '../../../hooks/useDataUpdateHighlight';
import AnimatedNumber from '../../common/AnimatedNumber';
import '../../../styles/DataUpdateHighlight.css';

const ModelPerformanceCard = ({ modelPerformance, onCardClick, onDetailsClick, isExpanded }) => {
  // 计算所有模型的平均指标
  const calculateAverages = () => {
    if (!modelPerformance || modelPerformance.length === 0) {
      return {
        准确率: 0,
        精确率: 0,
        召回率: 0,
        F1得分: 0,
        AUC: 0
      };
    }
    
    const metrics = ['准确率', '精确率', '召回率', 'F1得分', 'AUC'];
    const result = {};
    
    metrics.forEach(metric => {
      const sum = modelPerformance.reduce((acc, model) => acc + model[metric], 0);
      result[metric] = sum / modelPerformance.length;
    });
    
    return result;
  };
  
  // 显示表现最好的模型
  const getBestModel = (metric) => {
    if (!modelPerformance || modelPerformance.length === 0) return null;
    
    return modelPerformance.reduce((best, current) => 
      current[metric] > best[metric] ? current : best
    );
  };
  
  const averages = calculateAverages();
  const bestAccuracyModel = getBestModel('准确率');
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('准确率');
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [modelCompare, setModelCompare] = useState(false);
  
  const highlight = useDataUpdateHighlight(modelPerformance);

  // 重置选中状态
  useEffect(() => {
    if (!isExpanded) {
      setSelectedModel(null);
      setModelCompare(false);
    }
  }, [isExpanded]);

  // 处理模型点击
  const handleModelClick = (modelName) => {
    setSelectedModel(selectedModel === modelName ? null : modelName);
  };

  // 处理指标点击
  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
  };

  // 组织模型数据用于渲染
  const getModelsForDisplay = () => {
    if (modelCompare) {
      return modelPerformance;
    }
    // 默认只显示3个最佳模型
    return [...modelPerformance]
      .sort((a, b) => b[selectedMetric] - a[selectedMetric])
      .slice(0, 3);
  };

  // 获取指标背景色
  const getMetricColor = (value) => {
    if (value >= 0.9) return '#4be1a0';
    if (value >= 0.85) return '#e6b45e';
    return '#e65e5e';
  };

  const displayModels = getModelsForDisplay();

  return (
    <div className={`dashboard-card${highlight ? ' data-update-highlight' : ''}`}
      style={{ position: 'relative', transition: 'box-shadow 0.2s, transform 0.18s, height 0.3s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px #4be1a099, 0 0 0 3px #4be1a0'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
      onClick={onCardClick}
    >
      <div className="card-header">
        <h3 className="card-title">模型性能对比</h3>
        <div style={{ 
          fontSize: '12px', 
          padding: '3px 8px', 
          backgroundColor: 'rgba(75, 225, 160, 0.2)', 
          color: '#4be1a0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span className="health-score-ring" style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#4be1a0',
            display: 'inline-block' 
          }}></span>
          <span>平均: <AnimatedNumber value={averages['准确率'] * 100} format={val => val.toFixed(1) + '%'} /></span>
        </div>
      </div>
      
      <div className="card-content" style={{ minHeight: isExpanded ? '300px' : '180px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '12px', 
            color: '#eaf6ff',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>核心评估指标</span>
            {isExpanded && (
              <div className="metric-toggle" style={{ 
                display: 'flex', 
                gap: '8px' 
              }}>
                {['准确率', '精确率', '召回率', 'F1得分', 'AUC'].map((metric) => (
                  <span 
                    key={metric}
                    style={{ 
                      fontSize: '12px',
                      color: selectedMetric === metric ? '#4be1a0' : '#99b7ff',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: selectedMetric === metric ? 'rgba(75, 225, 160, 0.1)' : 'transparent'
                    }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleMetricClick(metric); 
                    }}
                  >
                    {metric}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['准确率', '精确率', '召回率'].map((metric, idx) => (
              <div 
                key={metric} 
                style={{ 
                  position: 'relative',
                  opacity: isExpanded && selectedMetric !== metric && selectedMetric !== 'all' ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={() => setHoveredMetric(metric)}
                onMouseLeave={() => setHoveredMetric(null)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#99b7ff' }}>{metric}</span>
                  <span style={{ fontSize: '13px', color: '#eaf6ff', fontWeight: 'bold' }}>
                    <AnimatedNumber 
                      value={averages[metric] * 100} 
                      format={val => val.toFixed(1) + '%'} 
                    />
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill success${hoveredMetric === metric ? ' animated' : ''}`}
                    style={{ 
                      width: `${averages[metric] * 100}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  />
                </div>
                {hoveredMetric === metric && (
                  <div style={{
                    position: 'absolute',
                    right: '-8px',
                    top: '0',
                    background: '#223366',
                    color: '#4be1a0',
                    fontSize: 12,
                    padding: '4px 10px',
                    borderRadius: 6,
                    boxShadow: '0 2px 8px #00152955',
                    pointerEvents: 'none',
                    zIndex: 2,
                    whiteSpace: 'nowrap',
                    opacity: 0.96
                  }}>
                    {metric === '准确率' ? '预测结果的整体正确比例' : 
                     metric === '精确率' ? '预测为正的样本中实际为正的比例' : 
                     '实际为正的样本中被正确预测的比例'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1e3a6d', 
          borderRadius: '8px', 
          padding: '12px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            color: '#eaf6ff',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>表现最佳模型</span>
            {isExpanded && (
              <span 
                style={{ 
                  fontSize: '12px', 
                  color: modelCompare ? '#4be1a0' : '#99b7ff', 
                  cursor: 'pointer',
                  transition: 'color 0.18s'
                }}
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setModelCompare(!modelCompare); 
                }}
              >
                {modelCompare ? '显示前3名' : '比较所有模型'}
              </span>
            )}
          </div>
          
          {isExpanded ? (
            <div className="model-comparison" style={{ maxHeight: '150px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ color: '#99b7ff' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px' }}>模型名称</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>准确率</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>精确率</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>召回率</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px' }}>F1得分</th>
                  </tr>
                </thead>
                <tbody>
                  {displayModels.map((model, idx) => (
                    <tr key={idx} 
                      style={{ 
                        background: selectedModel === model['模型名称'] ? '#223366' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.18s'
                      }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleModelClick(model['模型名称']); 
                      }}
                    >
                      <td style={{ 
                        padding: '6px 4px', 
                        borderBottom: '1px solid #2a3c6e',
                        color: selectedModel === model['模型名称'] ? '#4be1a0' : '#eaf6ff',
                        fontWeight: selectedModel === model['模型名称'] ? 'bold' : 'normal'
                      }}>
                        {model['模型名称']}
                      </td>
                      {['准确率', '精确率', '召回率', 'F1得分'].map((metric) => (
                        <td key={metric} style={{ 
                          padding: '6px 4px', 
                          textAlign: 'right',
                          borderBottom: '1px solid #2a3c6e',
                          color: getMetricColor(model[metric])
                        }}>
                          {(model[metric] * 100).toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            bestAccuracyModel && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ color: '#4be1a0', fontWeight: 'bold' }}>{bestAccuracyModel['模型名称']}</div>
                  <div style={{ 
                    backgroundColor: 'rgba(75, 225, 160, 0.2)', 
                    color: '#4be1a0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    准确率 <AnimatedNumber value={bestAccuracyModel['准确率'] * 100} format={val => val.toFixed(1) + '%'} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <div style={{ 
                    flex: 1, 
                    backgroundColor: '#15294e', 
                    padding: '6px', 
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = ''; 
                    e.currentTarget.style.boxShadow = '';
                  }}
                  title="预测为正的样本中实际为正的比例"
                  >
                    <div style={{ color: '#4be1a0', fontWeight: 'bold' }}>
                      <AnimatedNumber value={bestAccuracyModel['精确率'] * 100} format={val => val.toFixed(1) + '%'} />
                    </div>
                    <div style={{ color: '#99b7ff', fontSize: '11px' }}>精确率</div>
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    backgroundColor: '#15294e', 
                    padding: '6px', 
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = ''; 
                    e.currentTarget.style.boxShadow = '';
                  }}
                  title="实际为正的样本中被正确预测的比例"
                  >
                    <div style={{ color: '#4be1a0', fontWeight: 'bold' }}>
                      <AnimatedNumber value={bestAccuracyModel['召回率'] * 100} format={val => val.toFixed(1) + '%'} />
                    </div>
                    <div style={{ color: '#99b7ff', fontSize: '11px' }}>召回率</div>
                  </div>
                  
                  <div style={{ 
                    flex: 1, 
                    backgroundColor: '#15294e', 
                    padding: '6px', 
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '12px',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.transform = 'translateY(-2px)'; 
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.transform = ''; 
                    e.currentTarget.style.boxShadow = '';
                  }}
                  title="精确率和召回率的调和平均"
                  >
                    <div style={{ color: '#4be1a0', fontWeight: 'bold' }}>
                      <AnimatedNumber value={bestAccuracyModel['F1得分'] * 100} format={val => val.toFixed(1) + '%'} />
                    </div>
                    <div style={{ color: '#99b7ff', fontSize: '11px' }}>F1得分</div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
        
        {isExpanded && selectedModel && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px',
            backgroundColor: '#15294e',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#eaf6ff', marginBottom: '8px' }}>
              {selectedModel} 详细信息
            </div>
            <div style={{ color: '#99b7ff', lineHeight: '1.4' }}>
              该模型为{selectedModel.includes('RF') ? '随机森林' : selectedModel.includes('LSTM') ? '长短期记忆网络' : selectedModel.includes('XGB') ? 'XGBoost' : '梯度提升树'}类型，
              于{modelPerformance.find(m => m['模型名称'] === selectedModel)?.['更新时间'] || '2024-05-15'}部署，
              当前稳定性得分为{modelPerformance.find(m => m['模型名称'] === selectedModel)?.['稳定性'] ? 
                (modelPerformance.find(m => m['模型名称'] === selectedModel)?.['稳定性'] * 100).toFixed(1) + '%' : '92.5%'}。
            </div>
          </div>
        )}
        
        {highlight && (
          <div className="data-update-badge">已更新</div>
        )}
      </div>
      
      <div className="card-footer">
        <div>监控模型: {modelPerformance.length}</div>
        <div className="card-action" style={{ 
          transition: 'color 0.18s, transform 0.2s',
          cursor: 'pointer'
        }}
          onMouseEnter={e => { 
            e.currentTarget.style.color = '#4be1a0';
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.color = '';
            e.currentTarget.style.transform = '';
          }}
          onClick={e => {
            e.stopPropagation();
            onDetailsClick && onDetailsClick();
          }}
        >
          查看性能详情 &gt;
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceCard; 