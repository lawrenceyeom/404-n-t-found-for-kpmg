import React from 'react';
import { CARD_STYLE_BASE, CONTENT_BOX_STYLE } from '../../constants';

const AlertNotificationCard = ({ alert, onClick }) => {
  if (!alert) return null;
  return (
    <div
      style={{
        ...CARD_STYLE_BASE,
        display: 'flex', flexDirection: 'row', alignItems: 'center',
        border: `2.5px solid ${alert.color || '#40a9ff'}`,
        boxShadow: alert.level === '高' ? '0 0 24px #ff5c5c88' : '0 2px 16px #22336633',
        animation: alert.level === '高' ? 'alert-flash 1.2s infinite alternate' : 'none',
        position: 'relative', cursor: 'pointer',
      }}
      onClick={onClick}
    >
      <div style={{ minWidth: 38, minHeight: 38, width: 38, height: 38, borderRadius: '50%', background: alert.color || '#4be1a0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', marginRight: 16, boxShadow: alert.level === '高' ? '0 0 8px #ff5c5c88' : 'none', animation: alert.level === '高' ? 'alert-flash 1.2s infinite alternate' : 'none' }}>
        <span role="img" aria-label="alert">⚠️</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ color: alert.color || '#40a9ff', fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 2 }}>预警与通知</span>
        <div style={{ ...CONTENT_BOX_STYLE, fontSize: 15, color: alert.color || '#fff', fontWeight: 600, minHeight: 24 }}>{alert.msg || '暂无预警'}</div>
        <div style={{ fontSize: 13, color: '#b3cfff', marginTop: 2 }}>{alert.time} | 维度：{alert.dim}</div>
        <div style={{ fontSize: 12, color: '#40a9ff', marginTop: 4, fontWeight: 500 }}>[点击查看历史预警]</div>
      </div>
      {alert.level === '高' && (
        <div style={{ position: 'absolute', top: 8, right: 18, color: '#ff5c5c', fontWeight: 900, fontSize: 15, letterSpacing: 1, textShadow: '0 0 8px #ff5c5c88' }}>重大风险</div>
      )}
    </div>
  );
};

export default AlertNotificationCard; 