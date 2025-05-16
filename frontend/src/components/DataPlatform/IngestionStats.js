import React, { useState, useEffect } from 'react';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';

const IngestionStats = ({ ingestionStats }) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [timeRange, setTimeRange] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState({
    '财务数据': true,
    '运营数据': true,
    '舆情数据': true,
    '宏观数据': true
  });
  const [hoveredDay, setHoveredDay] = useState(null);
  const [filteredStats, setFilteredStats] = useState([]);
  const highlight = useDataUpdateHighlight(ingestionStats);

  // Effect to update filtered stats when timeRange, selectedTypes, or ingestionStats change
  useEffect(() => {
    const filtered = applyDataTypeFilters(getFilteredStatsByTime());
    setFilteredStats(filtered);
  }, [timeRange, selectedTypes, ingestionStats]);

  // Get the highest value in the dataset to scale the charts properly
  const getMaxValue = () => {
    let max = 0;
    filteredStats.forEach(day => {
      if (day.total > max) max = day.total;
    });
    return max;
  };

  // Format large numbers with abbreviation
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Get total data ingested
  const getTotalIngested = () => {
    return filteredStats.reduce((acc, day) => acc + day.total, 0);
  };

  // Get average data ingested per day
  const getAveragePerDay = () => {
    if (filteredStats.length === 0) return 0;
    return getTotalIngested() / filteredStats.length;
  };

  // Get growth rate compared to previous period
  const getGrowthRate = () => {
    if (filteredStats.length < 2) return 0;
    
    // Divide the date range into two equal parts
    const halfIndex = Math.floor(filteredStats.length / 2);
    const firstHalf = filteredStats.slice(0, halfIndex);
    const secondHalf = filteredStats.slice(halfIndex);
    
    const firstHalfTotal = firstHalf.reduce((acc, day) => acc + day.total, 0);
    const secondHalfTotal = secondHalf.reduce((acc, day) => acc + day.total, 0);
    
    if (firstHalfTotal === 0) return 100; // Avoid division by zero
    
    return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
  };

  // Filter stats based on selected time range
  const getFilteredStatsByTime = () => {
    if (!ingestionStats || !Array.isArray(ingestionStats)) return [];
    
    const now = new Date();
    const stats = [...ingestionStats].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    switch (timeRange) {
      case '7days':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        return stats.filter(day => new Date(day.date) >= sevenDaysAgo);
      case '30days':
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return stats.filter(day => new Date(day.date) >= thirtyDaysAgo);
      case '90days':
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return stats.filter(day => new Date(day.date) >= ninetyDaysAgo);
      default:
        return stats;
    }
  };

  // Apply data type filters
  const applyDataTypeFilters = (stats) => {
    return stats.map(day => {
      // Create a shallow copy of the day
      const filteredDay = { ...day };
      filteredDay.total = 0;
      
      // Only include selected data types
      Object.keys(selectedTypes).forEach(type => {
        if (selectedTypes[type]) {
          filteredDay[type] = day[type] || 0;
          filteredDay.total += filteredDay[type];
        } else {
          filteredDay[type] = 0;
        }
      });
      
      return filteredDay;
    });
  };

  // Toggle data type selection
  const toggleDataType = (type) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Handle chart bar hover
  const handleBarHover = (day) => {
    setHoveredDay(day);
  };

  // Handle chart bar leave
  const handleBarLeave = () => {
    setHoveredDay(null);
  };

  // Get color for growth indicator
  const getGrowthColor = (rate) => {
    if (rate > 10) return '#4be1a0';
    if (rate >= 0) return '#e6b45e';
    return '#e65e5e';
  };

  // Get icon for growth indicator
  const getGrowthIcon = (rate) => {
    if (rate > 0) return '↑';
    if (rate < 0) return '↓';
    return '→';
  };

  return (
    <div className={`ingestion-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="section-header">
    <div>
      <h3 style={{ marginTop: 0, marginBottom: 16, color: '#eaf6ff' }}>数据摄入统计</h3>
      <p style={{ marginBottom: 20, fontSize: 14, color: '#99b7ff' }}>
        平台每日摄入的数据量，按类型分类展示。
      </p>
        </div>
        
        <div className="controls">
          <div className="time-range-selector">
            <label htmlFor="time-range">时间范围：</label>
            <select 
              id="time-range" 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="select-control"
            >
              <option value="all">全部时间</option>
              <option value="7days">最近7天</option>
              <option value="30days">最近30天</option>
              <option value="90days">最近90天</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="stats-summary">
        <div className="summary-card">
          <div className="summary-value">{formatNumber(getTotalIngested())}</div>
          <div className="summary-label">总数据量</div>
        </div>
        
        <div className="summary-card">
          <div className="summary-value">{filteredStats.length}</div>
          <div className="summary-label">统计天数</div>
          </div>
        
        <div className="summary-card">
          <div className="summary-value">{formatNumber(Math.round(getAveragePerDay()))}</div>
          <div className="summary-label">日均摄入量</div>
        </div>
        
        <div className="summary-card growth-card">
          <div className="summary-value">
            <span style={{ color: getGrowthColor(getGrowthRate()) }}>
              {getGrowthIcon(getGrowthRate())} {Math.abs(getGrowthRate()).toFixed(1)}%
            </span>
          </div>
          <div className="summary-label">环比增长率</div>
        </div>
      </div>
      
      <div className="stats-content">
        <div className="data-types-filter">
          <div className="filter-title">数据类型筛选：</div>
          <div className="filter-options">
            {Object.keys(selectedTypes).map(type => (
              <label key={type} className={`filter-option ${selectedTypes[type] ? 'selected' : ''}`}>
                <input 
                  type="checkbox" 
                  checked={selectedTypes[type]} 
                  onChange={() => toggleDataType(type)}
                />
                <span className="checkmark"></span>
                <span className={`type-color ${type.replace(/数据/g, '')}`}></span>
                {type}
              </label>
            ))}
          </div>
        </div>
        
        <div className="chart-controls">
          <h4>每日数据摄入趋势</h4>
          <button
            className="view-toggle-button"
            onClick={() => setShowDetailView(!showDetailView)}
          >
            {showDetailView ? '切换至图表视图' : '切换至详细视图'}
          </button>
        </div>
        
        {!showDetailView ? (
          <div className="chart-view">
            <div className="chart-container">
              {filteredStats.map((day, index) => (
                <div 
                  key={index} 
                  className="chart-bar-container"
                  onMouseEnter={() => handleBarHover(day)}
                  onMouseLeave={handleBarLeave}
                >
                  <div className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ 
                        height: `${(day.total / getMaxValue()) * 260}px`,
                      }}
                    >
                    <div 
                        className="bar-segment 宏观"
                      style={{ 
                          height: `${(day['宏观数据'] / day.total) * 100}%`,
                      }}
                        title={`宏观数据: ${formatNumber(day['宏观数据'])}`}
                    ></div>
                    <div 
                        className="bar-segment 舆情"
                      style={{ 
                        height: `${(day['舆情数据'] / day.total) * 100}%`, 
                      }}
                      title={`舆情数据: ${formatNumber(day['舆情数据'])}`}
                    ></div>
                    <div 
                        className="bar-segment 运营"
                        style={{ 
                          height: `${(day['运营数据'] / day.total) * 100}%`,
                        }}
                        title={`运营数据: ${formatNumber(day['运营数据'])}`}
                      ></div>
                      <div 
                        className="bar-segment 财务"
                      style={{ 
                          height: `${(day['财务数据'] / day.total) * 100}%`,
                      }}
                        title={`财务数据: ${formatNumber(day['财务数据'])}`}
                    ></div>
                  </div>
                  </div>
                  <div className="chart-date">{day.date.slice(5)}</div>
                </div>
              ))}
              
              {/* Bar hover tooltip */}
              {hoveredDay && (
                <div 
                  className="bar-tooltip"
                  style={{
                    top: window.event.clientY - 180,
                    left: window.event.clientX - 100,
                  }}
                >
                  <div className="tooltip-header">{hoveredDay.date}</div>
                  <div className="tooltip-total">总计: {formatNumber(hoveredDay.total)} 条</div>
                  <div className="tooltip-details">
                    {Object.keys(selectedTypes).map(type => (
                      selectedTypes[type] && (
                        <div key={type} className="tooltip-detail-item">
                          <span className={`tooltip-type-color ${type.replace(/数据/g, '')}`}></span>
                          <span className="tooltip-type-name">{type}:</span>
                          <span className="tooltip-type-value">{formatNumber(hoveredDay[type] || 0)}</span>
                          <span className="tooltip-type-percent">
                            ({hoveredDay.total ? Math.round((hoveredDay[type] || 0) / hoveredDay.total * 100) : 0}%)
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="chart-legend">
              {Object.keys(selectedTypes).filter(type => selectedTypes[type]).map(type => (
                <div key={type} className="legend-item">
                  <div className={`legend-color ${type.replace(/数据/g, '')}`}></div>
                  <span>{type}</span>
              </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="detail-view">
            <table className="detail-table">
                <thead>
                <tr>
                  <th>日期</th>
                  {Object.keys(selectedTypes).filter(type => selectedTypes[type]).map(type => (
                    <th key={type}>{type}</th>
                  ))}
                  <th>总计</th>
                  </tr>
                </thead>
                <tbody>
                {filteredStats.map((day, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                    <td>{day.date}</td>
                    {Object.keys(selectedTypes).filter(type => selectedTypes[type]).map(type => (
                      <td key={type}>
                        {formatNumber(day[type] || 0)}
                        <span className="percent-indicator">
                          ({day.total ? Math.round((day[type] || 0) / day.total * 100) : 0}%)
                        </span>
                      </td>
                    ))}
                    <td className="total-cell">{formatNumber(day.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .ingestion-container {
          transition: box-shadow 0.3s ease;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        .controls {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        
        .time-range-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #eaf6ff;
          font-size: 14px;
        }
        
        .select-control {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .stats-summary {
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
          align-items: center;
          justify-content: center;
          border: 1px solid #2a3c6e;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .summary-value {
          font-size: 30px;
          font-weight: bold;
          color: #4be1a0;
          margin-bottom: 8px;
        }
        
        .growth-card .summary-value {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
        }
        
        .summary-label {
          font-size: 14px;
          color: #99b7ff;
          text-align: center;
        }
        
        .stats-content {
          background-color: #15294e;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #2a3c6e;
        }
        
        .data-types-filter {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .filter-title {
          font-size: 14px;
          color: #eaf6ff;
          font-weight: bold;
        }
        
        .filter-options {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .filter-option {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #99b7ff;
          cursor: pointer;
          user-select: none;
          position: relative;
          padding-left: 24px;
        }
        
        .filter-option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .checkmark {
          position: absolute;
          left: 0;
          height: 16px;
          width: 16px;
          background-color: #1e3a6d;
          border: 1px solid #2a3c6e;
          border-radius: 3px;
        }
        
        .filter-option:hover .checkmark {
          background-color: #2a4d8d;
        }
        
        .filter-option input:checked ~ .checkmark {
          background-color: #4be1a0;
          border-color: #4be1a0;
        }
        
        .checkmark:after {
          content: "";
          position: absolute;
          display: none;
        }
        
        .filter-option input:checked ~ .checkmark:after {
          display: block;
        }
        
        .filter-option .checkmark:after {
          left: 5px;
          top: 2px;
          width: 3px;
          height: 8px;
          border: solid #0a1f44;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .filter-option.selected {
          color: #eaf6ff;
        }
        
        .type-color {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
        
        .type-color.财务 {
          background-color: #4be1a0;
        }
        
        .type-color.运营 {
          background-color: #e6b45e;
        }
        
        .type-color.舆情 {
          background-color: #e65e5e;
        }
        
        .type-color.宏观 {
          background-color: #5e9de6;
        }
        
        .chart-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .chart-controls h4 {
          margin: 0;
          color: #eaf6ff;
        }
        
        .view-toggle-button {
          background-color: #1e3a6d;
          color: #eaf6ff;
          border: 1px solid #2a3c6e;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .view-toggle-button:hover {
          background-color: #2a4d8d;
          transform: translateY(-2px);
        }
        
        .chart-view {
          position: relative;
        }
        
        .chart-container {
          height: 300px;
          display: flex;
          align-items: flex-end;
          margin-bottom: 10px;
          gap: 4px;
          position: relative;
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 30px;
        }
        
        .chart-bar {
          width: 70%;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 260px;
          position: relative;
        }
        
        .bar-fill {
          width: 100%;
          position: absolute;
          bottom: 0;
          left: 0;
          background-color: #1e3a6d;
          border-radius: 4px 4px 0 0;
          overflow: hidden;
          transition: height 0.5s ease;
          display: flex;
          flex-direction: column-reverse;
        }
        
        .bar-segment {
          width: 100%;
          transition: height 0.5s ease;
        }
        
        .bar-segment.财务 {
          background-color: #4be1a0;
        }
        
        .bar-segment.运营 {
          background-color: #e6b45e;
        }
        
        .bar-segment.舆情 {
          background-color: #e65e5e;
        }
        
        .bar-segment.宏观 {
          background-color: #5e9de6;
          border-radius: 4px 4px 0 0;
        }
        
        .chart-date {
          font-size: 12px;
          margin-top: 8px;
          color: #99b7ff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #eaf6ff;
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
        }
        
        .legend-color.财务 {
          background-color: #4be1a0;
        }
        
        .legend-color.运营 {
          background-color: #e6b45e;
        }
        
        .legend-color.舆情 {
          background-color: #e65e5e;
        }
        
        .legend-color.宏观 {
          background-color: #5e9de6;
        }
        
        .bar-tooltip {
          position: absolute;
          background-color: #223366;
          border: 1px solid #2a3c6e;
          border-radius: 6px;
          padding: 12px;
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 1000;
          pointer-events: none;
          animation: tooltipFadeIn 0.2s ease;
        }
        
        .tooltip-header {
          font-weight: bold;
          color: #eaf6ff;
          margin-bottom: 8px;
          border-bottom: 1px solid #2a3c6e;
          padding-bottom: 6px;
        }
        
        .tooltip-total {
          color: #4be1a0;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .tooltip-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .tooltip-detail-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #eaf6ff;
        }
        
        .tooltip-type-color {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        
        .tooltip-type-name {
          flex: 1;
        }
        
        .tooltip-type-value {
          font-weight: bold;
        }
        
        .tooltip-type-percent {
          color: #99b7ff;
          font-size: 12px;
          margin-left: 4px;
        }
        
        .detail-view {
          overflow-x: auto;
        }
        
        .detail-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .detail-table th,
        .detail-table td {
          padding: 10px;
          border: 1px solid #2a3c6e;
          text-align: right;
        }
        
        .detail-table th {
          background-color: #1e3a6d;
          color: #eaf6ff;
          font-weight: bold;
          text-align: center;
        }
        
        .detail-table th:first-child,
        .detail-table td:first-child {
          text-align: left;
        }
        
        .detail-table .even-row {
          background-color: #152642;
        }
        
        .detail-table .odd-row {
          background-color: #1a304d;
        }
        
        .percent-indicator {
          font-size: 12px;
          color: #99b7ff;
          margin-left: 4px;
        }
        
        .total-cell {
          font-weight: bold;
          color: #4be1a0;
        }
        
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .controls {
            width: 100%;
          }
          
          .chart-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .data-types-filter {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .chart-bar {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default IngestionStats; 