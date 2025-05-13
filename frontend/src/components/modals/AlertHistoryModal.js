import React from 'react';
import AuditIcon from '../common/AuditIcon';

const AlertHistoryModal = ({ isOpen, onClose, history, alertDetailData, onCloseDetail, onOpenDetail, riskDimensions }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 9999,
      background: 'rgba(10,31,68,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#162447', borderRadius: 16, padding: '28px 32px 18px 32px', minWidth: 480, maxWidth: 700, boxShadow: '0 4px 32px #00152955', border: '2.5px solid #40a9ff', color: '#eaf6ff', position: 'relative' }}>
        <h3 style={{ color: '#40a9ff', fontWeight: 800, fontSize: 22, margin: 0, marginBottom: 18 }}><AuditIcon />历史预警（审计风险）</h3>
        <div style={{ maxHeight: 340, overflowY: 'auto', marginBottom: 12 }}>
          {history.length === 0 && <div style={{ color: '#b3cfff', textAlign: 'center', padding: 24 }}>暂无历史预警</div>}
          {history.map(alert => (
            <div
              key={alert.id}
              onClick={() => onOpenDetail && onOpenDetail(alert.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #223366', cursor: 'pointer',
                background: alert.level === '高' ? 'linear-gradient(90deg, #ff5c5c33 60%, #162447 100%)' : 'none',
                animation: alert.level === '高' ? 'alert-flash 1.2s infinite alternate' : 'none',
                borderLeft: `5px solid ${alert.color}`,
              }}
            >
              <AuditIcon />
              <span style={{ color: alert.color, fontWeight: 800, fontSize: 17, minWidth: 32 }}>{alert.level}</span>
              <span style={{ color: '#b3cfff', fontWeight: 700, minWidth: 110 }}>{alert.time}</span>
              <span style={{ color: '#40a9ff', fontWeight: 700, minWidth: 80 }}>{alert.dim}</span>
              <span style={{ color: '#ffd666', fontWeight: 700, minWidth: 60 }}>{alert.audit_level}风险</span>
              <span style={{ color: '#eaf6ff', fontWeight: 600, flex: 1 }}>{alert.msg}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button onClick={onClose} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #223366', background: '#223366', color: '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>关闭</button>
        </div>
        {/* 详情弹窗 */}
        {alertDetailData && (
          <div style={{
            position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 10000,
            background: 'rgba(10,31,68,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ background: '#162447', borderRadius: 16, padding: '28px 32px 18px 32px', minWidth: 420, maxWidth: 600, boxShadow: '0 4px 32px #00152955', border: '2.5px solid #40a9ff', color: '#eaf6ff', position: 'relative' }}>
              <h4 style={{ color: alertDetailData.level === '高' ? '#ff5c5c' : alertDetailData.level === '中' ? '#ffd666' : '#4be1a0', fontWeight: 800, fontSize: 20, margin: 0, marginBottom: 10 }}><AuditIcon />{alertDetailData.level} - {alertDetailData.dim} <span style={{ color: '#ffd666', fontWeight: 700, fontSize: 16, marginLeft: 10 }}>{alertDetailData.audit_level}风险</span></h4>
              <div style={{ color: '#b3cfff', fontWeight: 700, marginBottom: 6 }}>{alertDetailData.time}</div>
              <div style={{ color: '#eaf6ff', fontWeight: 600, marginBottom: 8 }}>{alertDetailData.msg}</div>
              <div style={{ marginTop: 10, color: '#40a9ff', fontWeight: 700 }}>【审计关注点】<span style={{ color: '#eaf6ff', fontWeight: 500 }}>{alertDetailData.explanation?.replace('【审计关注点】','')}</span></div>
              <div style={{ color: '#ffd666', fontWeight: 700, marginTop: 8 }}>【对财务报表影响】<span style={{ color: '#eaf6ff', fontWeight: 500 }}>{alertDetailData.impact?.replace('【对财务报表影响】','')}</span></div>
              <div style={{ color: '#4be1a0', fontWeight: 700, marginTop: 8 }}>【建议的审计程序】<span style={{ color: '#eaf6ff', fontWeight: 500 }}>{alertDetailData.suggestion?.replace('【建议的审计程序】','')}</span></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 18 }}>
                <button onClick={onCloseDetail} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #223366', background: '#223366', color: '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>关闭详情</button>
              </div>
              <button onClick={onCloseDetail} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#b3cfff', fontSize: 22, cursor: 'pointer' }} title="关闭">×</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertHistoryModal; 