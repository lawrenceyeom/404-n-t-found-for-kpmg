import React from 'react';
import OpinionCard from './OpinionCard';
import AlertNotificationCard from './AlertNotificationCard';
import WeatherForecastCard from './WeatherForecastCard';
import UserFeedbackCard from './UserFeedbackCard';
import RiskRadarCard from './RiskRadarCard';

const DashboardGrid = ({
  opinionList,
  opinionIdx,
  currentAlerts,
  currentAlertIdx,
  riskScores,
  riskDimensions,
  weather,
  onOpenFeedback,
  onOpenAlertHistory,
  onOpenRadarDetail,
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1.2fr',
      gridTemplateRows: '1fr 1fr',
      gap: 28,
      marginTop: 32,
      width: '100%',
    }}>
      <OpinionCard opinionList={opinionList} opinionIdx={opinionIdx} />
      <AlertNotificationCard alert={currentAlerts[currentAlertIdx]} onClick={onOpenAlertHistory} />
      <RiskRadarCard riskScores={riskScores} riskDimensions={riskDimensions} onRadarClick={onOpenRadarDetail} />
      <WeatherForecastCard weather={weather} />
      <UserFeedbackCard onOpenFeedback={onOpenFeedback} />
    </div>
  );
};

export default DashboardGrid; 