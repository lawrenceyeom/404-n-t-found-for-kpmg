import React from 'react';
import { CARD_STYLE_BASE, CONTENT_BOX_STYLE } from '../../constants';

const UserFeedbackCard = ({ onOpenFeedback }) => {
  return (
    <div style={{ ...CARD_STYLE_BASE, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{ minWidth: 38, minHeight: 38, width: 38, height: 38, borderRadius: '50%', background: '#1e90ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', marginRight: 16 }}>
        <span role="img" aria-label="feedback">🔄</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ color: '#40a9ff', fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 2 }}>用户反馈闭环</span>
        <div style={{ ...CONTENT_BOX_STYLE, fontSize: 14, color: '#b3cfff', minHeight: 24 }}>欢迎提交建议或问题，助力平台优化！</div>
        <button onClick={onOpenFeedback} style={{ marginTop: 8, padding: '6px 18px', borderRadius: 8, border: '1.5px solid #40a9ff', background: 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 8px #40a9ff55' }}>提交反馈</button>
      </div>
    </div>
  );
};

export default UserFeedbackCard; 