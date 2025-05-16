import React from 'react';
import { useDataUpdateHighlight } from '../../../hooks/useDataUpdateHighlight';
import AnimatedNumber from '../../common/AnimatedNumber';
import '../../../styles/DataUpdateHighlight.css';

const FeatureImportanceCard = ({ featureImportance }) => {
  // 对特征进行排序并选取前5个
  const topFeatures = [...featureImportance]
    .sort((a, b) => b.重要性 - a.重要性)
    .slice(0, 5);
  
  // 获取类别颜色
  const getCategoryColor = (category) => {
    switch (category) {
      case '财务特征':
        return '#4be1a0';
      case '运营特征':
        return '#e6b45e';
      case '舆情特征':
        return '#e65e5e';
      case '宏观特征':
        return '#5e9de6';
      case '管理特征':
        return '#a45ee6';
      case '复合特征':
        return '#e45ee1';
      default:
        return '#4be1a0';
    }
  };
  
  const highlight = useDataUpdateHighlight(featureImportance);
  
  return (
    <div className={`dashboard-card${highlight ? ' data-update-highlight' : ''}`} 
      style={{ position: 'relative', transition: 'box-shadow 0.2s, transform 0.18s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px #4be1a099, 0 0 0 3px #4be1a0'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div className="card-header">
        <h3 className="card-title">特征重要性</h3>
        <div style={{ 
          fontSize: '12px', 
          padding: '3px 8px', 
          backgroundColor: 'rgba(75, 225, 160, 0.2)', 
          color: '#4be1a0',
          borderRadius: '12px'
        }}>
          风险预测模型
        </div>
        {highlight && (
          <div className="data-update-badge">已更新</div>
        )}
      </div>
      
      <div className="card-content">
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#99b7ff', marginBottom: '8px' }}>
            以下特征对模型预测结果的贡献最大
          </div>
          
          {topFeatures.map((feature, index) => (
            <div key={index} className="feature-bar" style={{ position: 'relative' }}>
              <div className="feature-name">
                {feature.特征名称}
                <span 
                  className="feature-category"
                  style={{ backgroundColor: `${getCategoryColor(feature.类别)}20`, color: getCategoryColor(feature.类别), transition: 'background 0.18s, color 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = getCategoryColor(feature.类别); e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${getCategoryColor(feature.类别)}20`; e.currentTarget.style.color = getCategoryColor(feature.类别); }}
                >
                  {feature.类别}
                </span>
              </div>
              <div className="feature-bar-container" style={{ transition: 'background 0.18s' }}>
                <div 
                  className="feature-bar-fill"
                  style={{ 
                    width: `${feature.重要性}%`,
                    backgroundColor: getCategoryColor(feature.类别),
                    transition: 'background 0.18s, width 0.5s',
                    cursor: 'pointer'
                  }}
                  title={`重要性：${feature.重要性.toFixed(1)}%`}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#40a9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = getCategoryColor(feature.类别); }}
                />
              </div>
              <div className="feature-value" style={{ transition: 'color 0.18s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#4be1a0'; }}
                onMouseLeave={e => { e.currentTarget.style.color = ''; }}
                title="特征对模型的贡献度百分比"
              >
                <AnimatedNumber value={feature.重要性} format={v => v.toFixed(1) + '%'} />
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#1e3a6d', 
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#eaf6ff' }}>
            特征解释
          </div>
          <div style={{ color: '#99b7ff', lineHeight: '1.4' }}>
            资产负债率、经营现金流比率等财务指标是风险评估的核心因素，
            同时舆情负面程度、行业景气指数等外部信息也提供了重要参考。
            特征重要性分析帮助理解模型决策逻辑，提高可解释性。
          </div>
        </div>
        <div className={`update-time${highlight ? ' data-update-highlight' : ''}`}>更新时间：{featureImportance[0]?.last_updated}</div>
      </div>
      
      <div className="card-footer">
        <div>特征总数: {featureImportance.length}</div>
        <div className="card-action">
          查看全部特征 &gt;
        </div>
      </div>
    </div>
  );
};

export default FeatureImportanceCard; 