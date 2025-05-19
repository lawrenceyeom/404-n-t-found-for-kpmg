import React, { memo, useCallback, useMemo } from 'react';
import { CARD_STYLE_BASE } from '../../constants';
import RadarCard from '../RadarCard';
import { useNavigate } from 'react-router-dom';

const RiskRadarCard = ({ riskScores, riskDimensions, onRadarClick }) => {
  const navigate = useNavigate();
  
  // Memoize the radar click handler to prevent re-renders of RadarCard
  const handleRadarClick = useCallback((dimensionIndex) => {
    // First handle the normal radar click behavior
    if (onRadarClick) {
      onRadarClick(dimensionIndex);
    }
    
    // Then navigate to the finance data in the data lake
    navigate('/datalake', { state: { initialDataType: 'finance', initialLayer: 'analysis' } });
  }, [onRadarClick, navigate]);
  
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
        <RadarCard riskScores={riskScores} RISK_DIMENSIONS={riskDimensions} onRadarClick={handleRadarClick} />
      </div>
    </div>
  );
};

// Define a custom comparison function for React.memo
function arePropsEqual(prevProps, nextProps) {
  // Check if riskScores have actually changed in value
  if (prevProps.riskScores?.length !== nextProps.riskScores?.length) {
    return false;
  }
  
  if (prevProps.riskScores) {
    for (let i = 0; i < prevProps.riskScores.length; i++) {
      if (prevProps.riskScores[i] !== nextProps.riskScores[i]) {
        return false;
      }
    }
  }
  
  // For riskDimensions, we just check if the reference has changed
  // since these are typically constant throughout the app
  if (prevProps.riskDimensions !== nextProps.riskDimensions) {
    return false;
  }
  
  // We don't compare onRadarClick functions since we're wrapping them
  // with our own memoized function
  
  return true;
}

export default memo(RiskRadarCard, arePropsEqual); 