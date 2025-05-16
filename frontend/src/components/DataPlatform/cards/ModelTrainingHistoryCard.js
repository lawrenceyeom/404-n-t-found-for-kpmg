import React, { useState } from 'react';
import { useDataUpdateHighlight } from '../../../hooks/useDataUpdateHighlight';
import '../../../styles/DataUpdateHighlight.css';

const mockHistory = [
  { version: '3.2.1', date: '2024-06-01', accuracy: 0.93, samples: 190000, duration: '5小时23分', note: '当前生产版本' },
  { version: '3.2.0', date: '2024-05-15', accuracy: 0.92, samples: 182000, duration: '4小时58分', note: '例行迭代更新' },
  { version: '3.1.9', date: '2024-05-01', accuracy: 0.91, samples: 175000, duration: '5小时10分', note: '例行迭代更新' },
  { version: '3.1.8', date: '2024-04-15', accuracy: 0.91, samples: 168000, duration: '4小时45分', note: '例行迭代更新' },
  { version: '3.1.7', date: '2024-04-01', accuracy: 0.90, samples: 160000, duration: '4小时30分', note: '例行迭代更新' },
];

const ModelTrainingHistoryCard = ({ history = mockHistory, onCardClick, onDetailsClick, isExpanded }) => {
  const highlight = useDataUpdateHighlight(history);
  const [hoveredRow, setHoveredRow] = useState(null);

  // 确保历史记录是有效的数组
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : mockHistory;

  // 安全地格式化数字
  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return typeof value === 'number' ? value.toLocaleString() : value.toString();
  };

  // 安全地格式化百分比
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    return typeof value === 'number' ? (value * 100).toFixed(2) + '%' : value.toString();
  };

  return (
    <div className={`dashboard-card${highlight ? ' data-update-highlight' : ''}`}
      style={{ position: 'relative', transition: 'box-shadow 0.2s, transform 0.18s', cursor: 'pointer', minHeight: 220 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 24px #4be1a099, 0 0 0 3px #4be1a0'; e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
      onClick={onCardClick}
    >
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">模型训练历史</h3>
        <button style={{ background: '#223366', color: '#4be1a0', border: 'none', borderRadius: 6, padding: '4px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'background 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#4be1a0'}
          onMouseLeave={e => e.currentTarget.style.background = '#223366'}
        >刷新</button>
      </div>
      <div className="card-content" style={{ marginTop: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ color: '#99b7ff', fontWeight: 600 }}>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>版本</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>训练日期</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>准确率</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>样本数</th>
              <th style={{ textAlign: 'right', padding: '4px 8px' }}>时长</th>
              <th style={{ textAlign: 'left', padding: '4px 8px' }}>备注</th>
            </tr>
          </thead>
          <tbody>
            {safeHistory.map((row, idx) => (
              <tr key={row.version || `row-${idx}`}
                style={{ background: hoveredRow === idx ? '#223366' : '', transition: 'background 0.18s', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{ padding: '4px 8px', color: '#eaf6ff', fontWeight: 600 }}>{row.version || `-`}</td>
                <td style={{ padding: '4px 8px', color: '#99b7ff' }}>{row.date || `-`}</td>
                <td style={{ padding: '4px 8px', color: hoveredRow === idx ? '#4be1a0' : '#eaf6ff', textAlign: 'right', fontWeight: 600 }}
                  title="模型在验证集上的准确率"
                >{formatPercentage(row.accuracy)}</td>
                <td style={{ padding: '4px 8px', color: hoveredRow === idx ? '#4be1a0' : '#eaf6ff', textAlign: 'right' }}
                  title="训练样本总数"
                >{formatNumber(row.samples)}</td>
                <td style={{ padding: '4px 8px', color: '#99b7ff', textAlign: 'right' }}
                  title="本次训练总耗时"
                >{row.duration || `-`}</td>
                <td style={{ padding: '4px 8px', color: hoveredRow === idx ? '#e6b45e' : '#99b7ff' }}
                  title={row.note}
                >{row.note || `-`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer" style={{ fontSize: 12, color: '#99b7ff', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
        <span>共{safeHistory.length}次训练记录，悬停可查看详细说明。</span>
        {onDetailsClick && (
          <div className="card-action" style={{ 
            transition: 'color 0.18s, transform 0.2s',
            cursor: 'pointer',
            fontSize: 12
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
              onDetailsClick();
            }}
          >
            查看完整历史 &gt;
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelTrainingHistoryCard; 