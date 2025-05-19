import React from 'react';
import { CARD_STYLE_BASE, CONTENT_BOX_STYLE } from '../../constants';
import WeatherSVG from '../common/WeatherSVG';
// Removed: import { useNavigate } from 'react-router-dom';

const WeatherForecastCard = ({ weather, onClick }) => {
  // Removed: const navigate = useNavigate();

  if (!weather) return null;

  const handleClick = () => {
    // Now, this only calls the onClick prop passed from DashboardGrid,
    // which should be App.js's handleOpenWeatherForecast to open the modal.
    if (onClick) {
      onClick();
    }
    // Removed: navigate('/datalake', { state: { initialDataType: 'finance', initialLayer: 'analysis' } });
  };

  return (
    <div
      style={{
        ...CARD_STYLE_BASE,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        border: `2.5px solid ${weather.color}`
      }}
      onClick={handleClick} // This now only opens the modal
    >
      <div style={{
        minWidth: 38,
        minHeight: 38,
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: weather.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#fff',
        marginRight: 16,
        boxShadow: `0 0 8px ${weather.color}55`
      }}>
        <WeatherSVG type={weather.type} animate={true} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ color: weather.color, fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 2 }}>气象预报系统</span>
        <div style={{ ...CONTENT_BOX_STYLE, fontSize: 15, color: weather.color, fontWeight: 600, minHeight: 24 }}>
          {weather.label}
        </div>
        <div style={{ fontSize: 13, color: '#b3cfff', marginTop: 2 }}>风险态势随数据实时变动</div>
        {/* The text "[点击查看解读]" might be slightly misleading now,
            as the whole card is clickable to open the modal.
            You might consider removing or rephrasing it if it causes confusion.
            For now, I'll leave it as is.
        */}
        <div style={{ fontSize: 12, color: '#ffd666', marginTop: 4, fontWeight: 500 }}>[点击查看解读]</div>
      </div>
    </div>
  );
};

export default WeatherForecastCard;