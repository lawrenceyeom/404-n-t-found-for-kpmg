import React from 'react';

const TrendControls = ({
  trendMode,
  setTrendMode,
  trendMetricMode,
  setTrendMetricMode,
  selectedRatios,
  setSelectedRatios,
  trendMetricKeys,
  setTrendMetricKeys,
  allRatiosConfig,
  initialTrendMetricKeysMain,
}) => {
  return (
    <div style={{ color: '#b3cfff', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        指标选择：
        <button onClick={() => {
          setTrendMetricMode('main');
          setTrendMetricKeys(initialTrendMetricKeysMain);
        }} style={{
          margin: '0 2px', padding: '4px 12px', borderRadius: 8, border: trendMetricMode === 'main' ? '2px solid #40a9ff' : '1.5px solid #223366', background: trendMetricMode === 'main' ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', color: trendMetricMode === 'main' ? '#fff' : '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: trendMetricMode === 'main' ? '0 0 8px #40a9ff55' : 'none', transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
        }}>主要项目</button>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button onClick={() => {
            setTrendMetricMode('ratio');
            setTrendMetricKeys(selectedRatios);
          }} style={{
            margin: '0 2px', padding: '4px 12px', borderRadius: 8, border: trendMetricMode === 'ratio' ? '2px solid #40a9ff' : '1.5px solid #223366', background: trendMetricMode === 'ratio' ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', color: trendMetricMode === 'ratio' ? '#fff' : '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: trendMetricMode === 'ratio' ? '0 0 8px #40a9ff55' : 'none', transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
          }}>财务比率 ▾</button>
          {trendMetricMode === 'ratio' && (
            <div style={{ position: 'absolute', top: 36, left: 0, background: '#223366', border: '1.5px solid #40a9ff', borderRadius: 10, boxShadow: '0 2px 12px #22336655', zIndex: 10, minWidth: 180, padding: 8 }}>
              {allRatiosConfig.map(r => (
                <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 15, margin: '4px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedRatios.includes(r.key)} onChange={e => {
                    let next = e.target.checked ? [...selectedRatios, r.key] : selectedRatios.filter(k => k !== r.key);
                    setSelectedRatios(next);
                    setTrendMetricKeys(next);
                  }} style={{ accentColor: '#40a9ff', width: 16, height: 16 }} />
                  {r.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendControls; 