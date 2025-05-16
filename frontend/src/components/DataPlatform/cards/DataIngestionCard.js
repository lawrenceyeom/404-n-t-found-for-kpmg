import React, { useState } from 'react';
import { useDataUpdateHighlight } from '../../../hooks/useDataUpdateHighlight';
import AnimatedNumber from '../../common/AnimatedNumber';
import '../../../styles/DataUpdateHighlight.css';

const DataIngestionCard = ({ ingestionStats }) => {
  // 按日期排序
  const sortedStats = [...ingestionStats].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // 获取最近5天数据
  const recentStats = sortedStats.slice(-5);
  
  // 获取最大值用于显示比例
  const getMaxValue = () => {
    let max = 0;
    recentStats.forEach(day => {
      if (day.total > max) max = day.total;
    });
    return max;
  };
  
  // 格式化大数字
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };
  
  // 计算当前摄入数据总量
  const totalData = ingestionStats.reduce((sum, item) => sum + item.total, 0);
  
  // 计算日均摄入量
  const dailyAverage = Math.round(totalData / ingestionStats.length);
  
  const highlight = useDataUpdateHighlight(ingestionStats);
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <div className={`dashboard-card${highlight ? ' data-update-highlight' : ''}`}
      style={{ position: 'relative', transition: 'box-shadow 0.2s, transform 0.18s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px #4be1a099, 0 0 0 3px #4be1a0'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
    >
      <div className="card-header">
        <h3 className="card-title">数据摄入趋势</h3>
        <div style={{ fontSize: '13px', color: '#99b7ff' }}>
          过去 {recentStats.length} 天
        </div>
      </div>
      
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div className="mini-stat" style={{ transition: 'box-shadow 0.18s, color 0.18s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#4be1a0'; e.currentTarget.style.boxShadow = '0 2px 8px #4be1a055'; }}
            onMouseLeave={e => { e.currentTarget.style.color = ''; e.currentTarget.style.boxShadow = ''; }}
            title="所有数据总量"
          >
            <div className="stat-icon success">
              <span>∑</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatNumber(totalData)}</div>
              <div className="stat-label">数据总量</div>
            </div>
          </div>
          
          <div className="mini-stat">
            <div className="stat-icon success">
              <span>Ø</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{formatNumber(dailyAverage)}</div>
              <div className="stat-label">日均摄入</div>
            </div>
          </div>
        </div>
        
        <div style={{ height: '160px', display: 'flex', alignItems: 'flex-end', marginBottom: '8px' }}>
          {recentStats.map((day, index) => (
            <div key={index} style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              position: 'relative'
            }}>
              <div style={{ 
                width: '80%', 
                height: `${(day.total / getMaxValue()) * 140}px`,
                backgroundColor: hoveredBar === index ? '#40a9ff' : '#1e3a6d',
                borderRadius: '4px 4px 0 0',
                display: 'flex',
                flexDirection: 'column-reverse',
                overflow: 'hidden',
                transition: 'background 0.18s, height 0.4s',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
              title={`总量: ${day.total}\n财务: ${day['财务数据']} 运营: ${day['运营数据']}\n舆情: ${day['舆情数据']} 宏观: ${day['宏观数据']}`}
              >
                <div style={{ 
                  height: `${(day['财务数据'] / day.total) * 100}%`, 
                  backgroundColor: '#4be1a0',
                  width: '100%'
                }}></div>
                <div style={{ 
                  height: `${(day['运营数据'] / day.total) * 100}%`, 
                  backgroundColor: '#e6b45e',
                  width: '100%'
                }}></div>
                <div style={{ 
                  height: `${(day['舆情数据'] / day.total) * 100}%`, 
                  backgroundColor: '#e65e5e',
                  width: '100%'
                }}></div>
                <div style={{ 
                  height: `${(day['宏观数据'] / day.total) * 100}%`, 
                  backgroundColor: '#5e9de6',
                  width: '100%',
                  borderRadius: '4px 4px 0 0'
                }}></div>
              </div>
              {hoveredBar === index && (
                <div style={{
                  position: 'absolute',
                  top: -32,
                  left: '50%',
                  transform: 'translateX(-50%)',
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
                  总量: {formatNumber(day.total)}<br/>
                  财务: {formatNumber(day['财务数据'])} 运营: {formatNumber(day['运营数据'])}<br/>
                  舆情: {formatNumber(day['舆情数据'])} 宏观: {formatNumber(day['宏观数据'])}
                </div>
              )}
              <div style={{ fontSize: '11px', marginTop: '4px', color: '#99b7ff' }}>
                {day.date.slice(5)}
              </div>
              <div style={{ fontSize: '11px', color: '#4be1a0', fontWeight: 'bold' }}>
                {formatNumber(day.total)}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#4be1a0' }}></div>
            <span style={{ fontSize: '11px' }}>财务数据</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#e6b45e' }}></div>
            <span style={{ fontSize: '11px' }}>运营数据</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#e65e5e' }}></div>
            <span style={{ fontSize: '11px' }}>舆情数据</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#5e9de6' }}></div>
            <span style={{ fontSize: '11px' }}>宏观数据</span>
          </div>
        </div>
        <div className={`update-time${highlight ? ' data-update-highlight' : ''}`}>最新摄入时间：{ingestionStats[ingestionStats.length - 1].last_ingest_time}</div>
      </div>
      
      <div className="card-footer">
        <div>峰值处理能力: <span style={{ color: '#4be1a0' }}>50K/小时</span></div>
        <div className="card-action">
          数据统计 &gt;
        </div>
      </div>
    </div>
  );
};

export default DataIngestionCard; 