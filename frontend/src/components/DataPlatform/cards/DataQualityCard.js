import React, { useState, useEffect } from 'react';
import { useDataUpdateHighlight } from '../../../hooks/useDataUpdateHighlight';
import '../../../styles/DataUpdateHighlight.css';

const DataQualityCard = ({ dataQuality }) => {
  // 计算整体质量分数
  const calculateOverallScore = () => {
    if (!dataQuality || dataQuality.length === 0) return 0;
    
    let totalScore = 0;
    let count = 0;
    
    dataQuality.forEach(item => {
      ['完整性', '准确性', '一致性', '时效性'].forEach(metric => {
        if (item[metric]) {
          totalScore += item[metric];
          count++;
        }
      });
    });
    
    return count > 0 ? Math.round(totalScore / count) : 0;
  };
  
  // 获取评分颜色类
  const getScoreClass = (score) => {
    if (score >= 93) return 'success';
    if (score >= 87) return 'warning';
    return 'danger';
  };

  const overallScore = calculateOverallScore();
  
  const [hoveredCell, setHoveredCell] = useState(null);
  const [hoveredMetric, setHoveredMetric] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState(null);
  const [pulseCells, setPulseCells] = useState([]);

  const highlight = useDataUpdateHighlight(dataQuality);

  // 自动刷新效果
  useEffect(() => {
    if (isAutoRefresh) {
      const timer = setInterval(() => {
        // 随机选择1-3个单元格进行脉冲动画
        const randomCells = [];
        const cellCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < cellCount; i++) {
          const rowIdx = Math.floor(Math.random() * dataQuality.length);
          const metrics = ['完整性', '准确性', '一致性', '时效性'];
          const colIdx = Math.floor(Math.random() * metrics.length);
          randomCells.push([rowIdx, colIdx]);
        }
        
        setPulseCells(randomCells);
        
        // 3秒后清除脉冲
        setTimeout(() => {
          setPulseCells([]);
        }, 3000);
      }, 10000);
      
      setRefreshTimer(timer);
    } else if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [isAutoRefresh, dataQuality]);

  // 检查单元格是否处于脉冲状态
  const isPulsingCell = (rowIdx, colIdx) => {
    return pulseCells.some(cell => cell[0] === rowIdx && cell[1] === colIdx);
  };

  return (
    <div className={`dashboard-card${highlight ? ' data-update-highlight' : ''}`}
      style={{ position: 'relative', transition: 'box-shadow 0.2s, transform 0.18s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px #4be1a099, 0 0 0 3px #4be1a0'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div className="card-header">
        <h3 className="card-title">数据质量</h3>
        <div style={{ 
          width: '40px', 
          height: '40px',
          borderRadius: '50%',
          backgroundColor: `rgba(${getScoreClass(overallScore) === 'success' ? '75, 225, 160' : getScoreClass(overallScore) === 'warning' ? '230, 180, 94' : '230, 94, 94'}, 0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getScoreClass(overallScore) === 'success' ? '#4be1a0' : getScoreClass(overallScore) === 'warning' ? '#e6b45e' : '#e65e5e',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: `0 0 20px rgba(${getScoreClass(overallScore) === 'success' ? '75, 225, 160' : getScoreClass(overallScore) === 'warning' ? '230, 180, 94' : '230, 94, 94'}, 0.2)`,
          transition: 'box-shadow 0.5s, transform 0.5s',
          cursor: 'pointer',
          animation: 'pulse 2s infinite'
        }}
        title={`整体质量分数: ${overallScore}`}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        >
          {overallScore}
        </div>
      </div>
      
      <div className="card-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div className="metric-box" style={{ 
            cursor: 'pointer', 
            transition: 'transform 0.18s, box-shadow 0.2s',
            padding: '12px',
            borderRadius: '8px',
            background: '#1e3a6d'
          }}
            onMouseEnter={e => { 
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px #00152933';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
            title="监控中的数据源类型"
          >
            <div className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#eaf6ff' }}>4</div>
            <div className="metric-label" style={{ fontSize: '13px', color: '#99b7ff' }}>数据源类型</div>
          </div>
          <div className="metric-box" style={{ 
            cursor: 'pointer', 
            transition: 'transform 0.18s, box-shadow 0.2s',
            padding: '12px',
            borderRadius: '8px',
            background: '#1e3a6d'
          }}
            onMouseEnter={e => { 
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px #00152933';
            }}
            onMouseLeave={e => { 
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
            title="监控中的质量指标组"
          >
            <div className="metric-value" style={{ fontSize: '24px', fontWeight: 'bold', color: '#eaf6ff' }}>{dataQuality.length}</div>
            <div className="metric-label" style={{ fontSize: '13px', color: '#99b7ff' }}>监控指标组</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '0' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 'bold', 
            marginBottom: '10px', 
            color: '#eaf6ff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>质量热力图</span>
            <span style={{ 
              fontSize: '12px', 
              color: isAutoRefresh ? '#4be1a0' : '#99b7ff', 
              cursor: 'pointer',
              transition: 'transform 0.18s, color 0.18s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: isAutoRefresh ? 'rgba(75, 225, 160, 0.1)' : 'transparent'
            }}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isAutoRefresh ? '#4be1a0' : 'transparent',
                border: isAutoRefresh ? 'none' : '1px solid #99b7ff',
                display: 'inline-block',
                marginRight: '4px'
              }}></span>
              自动刷新 {isAutoRefresh ? '开启' : '关闭'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="quality-table-wrapper" style={{ 
              borderRadius: '8px', 
              overflow: 'hidden', 
              marginBottom: '8px',
              position: 'relative'
            }}>
              <div className="quality-labels" style={{
                display: 'flex',
                marginBottom: '8px',
                borderBottom: '1px solid #1e3a6d',
                paddingBottom: '8px'
              }}>
                <div style={{ flex: '0 0 100px', color: '#99b7ff', fontWeight: 'bold', fontSize: '13px' }}>数据类型</div>
                {['完整性', '准确性', '一致性', '时效性'].map((metric, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      flex: '1', 
                      textAlign: 'center', 
                      color: hoveredMetric === metric ? '#4be1a0' : '#99b7ff', 
                      fontWeight: hoveredMetric === metric ? 'bold' : 'normal', 
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'color 0.18s, transform 0.18s'
                    }}
                    onMouseEnter={() => setHoveredMetric(metric)}
                    onMouseLeave={() => setHoveredMetric(null)}
                    title={
                      metric === '完整性' ? '数据字段无缺失的比例' : 
                      metric === '准确性' ? '数据值符合业务规则的比例' : 
                      metric === '一致性' ? '数据间相互一致的比例' : 
                      '数据更新及时性的比例'
                    }
                  >
                    {metric}
                  </div>
                ))}
              </div>
              
              <table className="quality-table" style={{ borderCollapse: 'separate', borderSpacing: '4px', width: '100%' }}>
                <tbody>
                  {dataQuality.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td style={{
                        padding: '8px 12px',
                        backgroundColor: '#1e3a6d',
                        color: '#eaf6ff',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        fontSize: '13px',
                        width: '100px'
                      }}>{row['数据类型']}</td>
                      {['完整性', '准确性', '一致性', '时效性'].map((col, colIdx) => {
                        const isPulsing = isPulsingCell(rowIdx, colIdx);
                        return (
                          <td key={colIdx}
                            style={{ 
                              background: getScoreClass(row[col]) === 'success' ? 'rgba(75, 225, 160, 0.2)' : 
                                      getScoreClass(row[col]) === 'warning' ? 'rgba(230, 180, 94, 0.2)' : 
                                      'rgba(230, 94, 94, 0.2)',
                              color: getScoreClass(row[col]) === 'success' ? '#4be1a0' : 
                                    getScoreClass(row[col]) === 'warning' ? '#e6b45e' : 
                                    '#e65e5e',
                              padding: '8px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              borderRadius: '4px',
                              position: 'relative',
                              transition: 'transform 0.18s, box-shadow 0.2s, background-color 0.3s',
                              cursor: 'pointer',
                              animation: isPulsing ? 'pulse-cell 2s' : 'none',
                              transform: hoveredCell && hoveredCell[0] === rowIdx && hoveredCell[1] === colIdx ? 'scale(1.05)' : 'scale(1)',
                              boxShadow: hoveredCell && hoveredCell[0] === rowIdx && hoveredCell[1] === colIdx ? '0 4px 12px #00152933' : 'none',
                              border: hoveredMetric === col ? `1px solid ${getScoreClass(row[col]) === 'success' ? '#4be1a0' : getScoreClass(row[col]) === 'warning' ? '#e6b45e' : '#e65e5e'}` : 'none'
                            }}
                            onMouseEnter={() => setHoveredCell([rowIdx, colIdx])}
                            onMouseLeave={() => setHoveredCell(null)}
                            title={`${row['数据类型']} - ${col}: ${row[col]}`}
                            onClick={() => {
                              // 点击单元格时显示详细信息的模态框效果
                              alert(`${row['数据类型']}的${col}指标详情:\n分数: ${row[col]}\n上次检查: ${row['最近更新']}\n记录数: ${row['记录数'].toLocaleString()}`);
                            }}
                          >
                            {row[col]}
                            {hoveredCell && hoveredCell[0] === rowIdx && hoveredCell[1] === colIdx && (
                              <div style={{
                                position: 'absolute',
                                top: -44,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: '#223366',
                                color: getScoreClass(row[col]) === 'success' ? '#4be1a0' : 
                                      getScoreClass(row[col]) === 'warning' ? '#e6b45e' : 
                                      '#e65e5e',
                                fontSize: 12,
                                padding: '4px 10px',
                                borderRadius: 6,
                                boxShadow: '0 2px 8px #00152955',
                                pointerEvents: 'none',
                                zIndex: 2,
                                whiteSpace: 'nowrap',
                                opacity: 0.96,
                                width: 'max-content'
                              }}>
                                {row['数据类型']} - {col}: {row[col]}
                                <div style={{ fontSize: 11, color: '#99b7ff', marginTop: 2 }}>
                                  {col === '完整性' ? '数据字段无缺失的比例' : 
                                  col === '准确性' ? '数据值符合业务规则的比例' : 
                                  col === '一致性' ? '数据间相互一致的比例' : 
                                  '数据更新及时性的比例'}
                                </div>
                                <div style={{ fontSize: 11, color: '#e6b45e', marginTop: 2 }}>
                                  点击查看详情
                                </div>
                              </div>
                            )}
                            {isPulsing && (
                              <span style={{
                                position: 'absolute',
                                right: '2px',
                                top: '2px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: '#4be1a0',
                                animation: 'pulse 1.5s infinite'
                              }}></span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-footer" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#4be1a0', borderRadius: '50%', marginRight: '4px' }}></div>
            <span>高 (93+)</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#e6b45e', borderRadius: '50%', marginRight: '4px' }}></div>
            <span>中 (87-92)</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#e65e5e', borderRadius: '50%', marginRight: '4px' }}></div>
            <span>低 (&lt;87)</span>
          </span>
        </div>
        <div className="card-action" style={{ 
          transition: 'color 0.18s, transform 0.2s',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
          onMouseEnter={e => { 
            e.currentTarget.style.color = '#4be1a0';
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.color = '';
            e.currentTarget.style.transform = '';
          }}
          onClick={() => alert('正在跳转到详细数据质量分析页面...')}
        >
          <span>查看详情</span>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>&gt;</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        
        @keyframes pulse-cell {
          0% { box-shadow: 0 0 0 0 rgba(75, 225, 160, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(75, 225, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(75, 225, 160, 0); }
        }
      `}</style>
    </div>
  );
};

export default DataQualityCard; 