import React, { memo } from 'react';
import { CARD_STYLE_BASE, CONTENT_BOX_STYLE } from '../../constants';
import { formatOpinionDate } from '../../utils/helpers';

const OpinionCard = ({ opinionList, opinionIdx }) => {
  console.log('OpinionCard rendering');
  const renderOpinionContent = () => {
    if (!opinionList || opinionList.length === 0) return <span style={{ color: '#b3cfff' }}>加载中...</span>;
    const op = opinionList[opinionIdx];
    if (!op) return <span style={{ color: '#b3cfff' }}>暂无舆情</span>;
    const dateStr = formatOpinionDate(op.date);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 700, color: op.type === 'news' ? '#40a9ff' : '#1e90ff', fontSize: 15 }}>
          {op.type === 'news' ? `【新闻】${op.source}` : `【社交】${op.platform} - ${op.user}`}
          <span style={{ marginLeft: 12, color: '#b3cfff', fontWeight: 400, fontSize: 13 }}>{dateStr}</span>
        </div>
        <div style={{ color: '#eaf6ff', fontSize: 16, fontWeight: 500, margin: '2px 0' }}>
          {op.title ? op.title + '：' : ''}{op.content}
        </div>
        <div style={{ fontSize: 13, color: op.sentiment === 'positive' ? '#4be1a0' : op.sentiment === 'negative' ? '#ff5c5c' : '#ffd666', fontWeight: 600 }}>
          情感：{op.sentiment === 'positive' ? '正面' : op.sentiment === 'negative' ? '负面' : '中性'}（{op.sentiment_score}）
          {op.keywords && op.keywords.length > 0 && (
            <>
              <span style={{ marginLeft: 10, color: '#40a9ff' }}>关键词：</span>
              {op.keywords.map((k, i) => <span key={i} style={{ marginRight: 6 }}>{k}</span>)}
            </>
          )}
        </div>
      </div>
    );
  };
  return (
    <div style={{ ...CARD_STYLE_BASE, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 38, minHeight: 38, width: 38, height: 38, borderRadius: '50%', background: '#40a9ff', fontSize: 22, color: '#fff', marginRight: 16 }}>
        <span role="img" aria-label="opinion">💬</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ color: '#40a9ff', fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 2 }}>舆情动态</span>
        <div style={{ ...CONTENT_BOX_STYLE, fontSize: 15, color: '#eaf6ff', fontWeight: 500, minHeight: 32 }}>
          {renderOpinionContent()}
        </div>
      </div>
    </div>
  );
};

export default memo(OpinionCard); 