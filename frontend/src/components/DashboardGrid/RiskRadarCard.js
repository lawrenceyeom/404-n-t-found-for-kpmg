import React, { memo } from 'react';
import { CARD_STYLE_BASE } from '../../constants';
import RadarCard from '../RadarCard';

const RiskRadarCard = ({ riskScores, riskDimensions, onRadarClick }) => {
  console.log('RiskRadarCard rendering');
  return (
    <div style={{
      ...CARD_STYLE_BASE,
      height: '100%',
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px 10px',
      gridColumn: '3',
      gridRow: '1 / span 2',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ffd666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff' }}>
          <span role="img" aria-label="radar">📊</span>
        </div>
        <span style={{ color: '#ffd666', fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>风险分布雷达图</span>
      </div>
      <div style={{ width: '100%', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RadarCard riskScores={riskScores} RISK_DIMENSIONS={riskDimensions} onRadarClick={onRadarClick} />
      </div>
    </div>
  );
};

export default memo(RiskRadarCard); 