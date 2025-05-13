import React from 'react';

const RadarDetailModal = ({ isOpen, onClose, modalData, riskDimensions, riskDimExplain, riskDimKeys }) => {
  if (!isOpen || !modalData) return null;
  const { dimIdx, score } = modalData;
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(10,31,68,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#162447', borderRadius: 16, padding: '28px 32px 18px 32px', minWidth: 420, maxWidth: 600, boxShadow: '0 4px 32px #00152955', border: '2.5px solid #40a9ff', color: '#eaf6ff', position: 'relative' }}>
        <h4 style={{ color: score > 60 ? '#ff5c5c' : '#ffd666', fontWeight: 800, fontSize: 20, margin: 0, marginBottom: 10 }}>{riskDimensions[dimIdx].name} 风险分数：{score}</h4>
        <div style={{ color: '#ffd666', fontWeight: 700, marginBottom: 8 }}>风险原因：<span style={{ color: '#eaf6ff', fontWeight: 500 }}>{riskDimExplain[riskDimKeys[dimIdx]].reason}</span></div>
        <div style={{ color: '#4be1a0', fontWeight: 700, marginBottom: 8 }}>审计建议：<span style={{ color: '#eaf6ff', fontWeight: 500 }}>{riskDimExplain[riskDimKeys[dimIdx]].advice}</span></div>
        <div style={{ color: '#b3cfff', fontWeight: 600, marginTop: 12 }}>详细下钻（后续开发）</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 18 }}>
          <button onClick={onClose} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #223366', background: '#223366', color: '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>关闭</button>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#b3cfff', fontSize: 22, cursor: 'pointer' }} title="关闭">×</button>
      </div>
    </div>
  );
};

export default RadarDetailModal; 