import React from 'react';

const FeedbackModal = ({ isOpen, onClose, feedbackType, setFeedbackType, feedbackContent, setFeedbackContent, feedbackContact, setFeedbackContact, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', zIndex: 9999,
      background: 'rgba(10,31,68,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#162447', borderRadius: 16, padding: '32px 32px 24px 32px', minWidth: 340, boxShadow: '0 4px 32px #00152955', border: '1.5px solid #223366', color: '#eaf6ff', position: 'relative' }}>
        <h3 style={{ color: '#40a9ff', fontWeight: 800, fontSize: 22, margin: 0, marginBottom: 18 }}>提交用户反馈</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, color: '#b3cfff', fontSize: 15 }}>反馈类型：</label>
          <select value={feedbackType} onChange={e => setFeedbackType(e.target.value)} style={{ marginLeft: 10, padding: '4px 12px', borderRadius: 6, border: '1px solid #223366', background: '#223366', color: '#eaf6ff', fontWeight: 600 }}>
            <option>功能建议</option>
            <option>数据问题</option>
            <option>风险预警</option>
            <option>其他</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 700, color: '#b3cfff', fontSize: 15 }}>反馈内容：</label>
          <textarea value={feedbackContent} onChange={e => setFeedbackContent(e.target.value)} rows={4} style={{ width: '100%', borderRadius: 6, border: '1px solid #223366', background: '#223366', color: '#eaf6ff', fontWeight: 600, fontSize: 15, padding: 8, resize: 'vertical' }} placeholder="请描述您的建议或遇到的问题..." />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 700, color: '#b3cfff', fontSize: 15 }}>联系方式：</label>
          <input value={feedbackContact} onChange={e => setFeedbackContact(e.target.value)} style={{ marginLeft: 10, borderRadius: 6, border: '1px solid #223366', background: '#223366', color: '#eaf6ff', fontWeight: 600, fontSize: 15, padding: '4px 10px' }} placeholder="选填，如邮箱/微信/电话" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
          <button onClick={onClose} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #223366', background: '#223366', color: '#b3cfff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>取消</button>
          <button onClick={onSubmit} style={{ padding: '7px 22px', borderRadius: 8, border: '1.5px solid #40a9ff', background: 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 0 8px #40a9ff55' }}>提交反馈</button>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#b3cfff', fontSize: 22, cursor: 'pointer' }} title="关闭">×</button>
      </div>
    </div>
  );
};

export default FeedbackModal; 