import React, { useState, memo, useRef, useEffect } from 'react';
import TrendChart from './TrendChart';
import { API_BASE } from '../../constants';
import { createPortal } from 'react-dom';

const ALL_RATIOS = [
  { key: 'debt_ratio', label: '资产负债率' },
  { key: 'current_ratio', label: '流动比率' },
  { key: 'quick_ratio', label: '速动比率' },
  { key: 'interest_debt_ratio', label: '有息负债占比' },
  { key: 'roe', label: '净资产收益率' },
  { key: 'capital_accumulation_ratio', label: '资本积累率' },
  { key: 'main_net_profit_ratio', label: '主营业务净利率' },
  { key: 'asset_turnover', label: '总资产周转率' },
  { key: 'receivable_turnover', label: '应收账款周转率' },
  { key: 'inventory_turnover', label: '存货周转率' },
];

const HistoricalTrendAnalysis = ({
  company,
  trendData,
  financeISData,
  trendPeriods,
  isLoading,
  allRatiosConfig,
  initialSelectedRatios,
  initialTrendMetricKeysMain,
}) => {
  // 控制指标切换、模式切换等本地状态
  const [trendMode, setTrendMode] = useState('value');
  const [trendMetricMode, setTrendMetricMode] = useState('main');
  const [selectedRatios, setSelectedRatios] = useState(initialSelectedRatios || ['debt_ratio', 'current_ratio', 'roe', 'interest_debt_ratio']);
  const [trendMetricKeys, setTrendMetricKeys] = useState(initialTrendMetricKeysMain || ['cash', 'receivable', 'debt']);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [drilldown, setDrilldown] = useState(null);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const dropdownBtnRef = useRef();
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 180 });

  useEffect(() => {
    if (showRatioDropdown && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width || 180
      });
    }
  }, [showRatioDropdown]);

  // 点击外部关闭
  useEffect(() => {
    if (!showRatioDropdown) return;
    const handleClick = (e) => {
      if (
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(e.target) &&
        document.getElementById('ratio-dropdown-portal') &&
        !document.getElementById('ratio-dropdown-portal').contains(e.target)
      ) {
        setShowRatioDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showRatioDropdown]);

  // 指标切换区块和趋势模式切换
  return (
    <section style={{ marginBottom: 36, background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)', borderRadius: 18, boxShadow: '0 4px 24px #22336644', border: '2px solid #223366', padding: '24px 24px 12px 24px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, color: '#40a9ff', fontSize: 20, letterSpacing: 1 }}>历史数据与趋势分析</div>
        <div style={{ color: '#b3cfff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          数据类型：
          {[
            { key: 'value', label: '数值' },
            { key: 'yoy', label: '同比增长率' },
            { key: 'qoq', label: '环比增长率' },
            { key: 'abnormal', label: '异常高亮' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setTrendMode(opt.key)} style={{
              margin: '0 2px', padding: '4px 12px', borderRadius: 8, border: trendMode === opt.key ? '2px solid #40a9ff' : '1.5px solid #223366', background: trendMode === opt.key ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', color: trendMode === opt.key ? '#fff' : '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: trendMode === opt.key ? '0 0 8px #40a9ff55' : 'none', transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
            }}>{opt.label}</button>
          ))}
        </div>
      </div>
      {/* 指标切换区块 */}
      <div style={{ color: '#b3cfff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        指标选择：
        <button onClick={() => {
          setTrendMetricMode('main');
          setTrendMetricKeys(['cash', 'receivable', 'debt']);
        }} style={{
          margin: '0 2px', padding: '4px 12px', borderRadius: 8, border: trendMetricMode === 'main' ? '2px solid #40a9ff' : '1.5px solid #223366', background: trendMetricMode === 'main' ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', color: trendMetricMode === 'main' ? '#fff' : '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: trendMetricMode === 'main' ? '0 0 8px #40a9ff55' : 'none', transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
        }}>主要项目</button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button ref={dropdownBtnRef} onClick={() => {
            setTrendMetricMode('ratio');
            setTrendMetricKeys(selectedRatios);
            setShowRatioDropdown(v => !v);
          }} style={{
            margin: '0 2px', padding: '4px 12px', borderRadius: 8, border: trendMetricMode === 'ratio' ? '2px solid #40a9ff' : '1.5px solid #223366', background: trendMetricMode === 'ratio' ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', color: trendMetricMode === 'ratio' ? '#fff' : '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: trendMetricMode === 'ratio' ? '0 0 8px #40a9ff55' : 'none', transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
          }}>财务比率 ▾</button>
          {showRatioDropdown && createPortal(
            <div id="ratio-dropdown-portal" style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, background: '#223366', border: '1.5px solid #40a9ff', borderRadius: 10, boxShadow: '0 2px 12px #22336655', zIndex: 9999, minWidth: dropdownPos.width, padding: 8 }}>
              {ALL_RATIOS.map(r => (
                <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 15, margin: '4px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedRatios.includes(r.key)} onChange={e => {
                    let next = e.target.checked ? [...selectedRatios, r.key] : selectedRatios.filter(k => k !== r.key);
                    setSelectedRatios(next);
                    setTrendMetricKeys(next);
                  }} style={{ accentColor: '#40a9ff', width: 16, height: 16 }} />
                  {r.label}
                </label>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>
      <div style={{ color: '#ffd666', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>点击数据点可下钻查看详细报表。异常高亮模式下，红点为同比/环比大于±20%的异常点。</div>
      <TrendChart
        trendData={trendData}
        financeISData={financeISData}
        trendPeriods={trendPeriods}
        trendMode={trendMode}
        trendMetricKeys={trendMetricKeys}
        trendMetricMode={trendMetricMode}
        isLoading={isLoading}
        onDrilldown={(year, item) => {
          console.log('Drilldown triggered in HistoricalTrendAnalysis:', year, item);
          setDrilldownLoading(true);
          fetch(`${API_BASE}/finance/table?sheet=合并-bs&company=${company}&periods=${year}`)
            .then(res => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              return res.json();
            })
            .then(data => {
              console.log('Drilldown data received:', data);
              setDrilldown({ year, item, data: data.data || [] });
            })
            .catch(error => {
              console.error('Drilldown fetch error:', error);
            })
            .finally(() => {
              setDrilldownLoading(false);
            });
        }}
      />
      {/* 下钻弹窗渲染 */}
      {drilldown && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(10,31,68,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#162447', borderRadius: 16, padding: '28px 32px 18px 32px', minWidth: 420, maxWidth: 700, boxShadow: '0 4px 32px #00152955', border: '2.5px solid #40a9ff', color: '#eaf6ff', position: 'relative' }}>
            <h3 style={{ color: '#40a9ff', fontWeight: 800, fontSize: 22, margin: 0, marginBottom: 18 }}>报表下钻：{drilldown.item}（{drilldown.year.replace('_Q1','年Q1末')}）</h3>
            {drilldownLoading ? <div style={{ color: '#b3cfff', textAlign: 'center', margin: 24 }}>数据加载中...</div> : (
              <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 12 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eaf6ff', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#223366' }}>
                      <th style={{ padding: '6px 12px', border: '1px solid #223366' }}>项目</th>
                      <th style={{ padding: '6px 12px', border: '1px solid #223366' }}>{drilldown.year.replace('_09','年9月末')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldown.data.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#22336644' : 'none' }}>
                        <td style={{ padding: '6px 12px', border: '1px solid #223366' }}>{row.item}</td>
                        <td style={{ padding: '6px 12px', border: '1px solid #223366' }}>{row[drilldown.year] != null ? Number(row[drilldown.year]).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button onClick={() => setDrilldown(null)} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #223366', background: '#223366', color: '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>关闭</button>
            </div>
            <button onClick={() => setDrilldown(null)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#b3cfff', fontSize: 22, cursor: 'pointer' }} title="关闭">×</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default memo(HistoricalTrendAnalysis); 