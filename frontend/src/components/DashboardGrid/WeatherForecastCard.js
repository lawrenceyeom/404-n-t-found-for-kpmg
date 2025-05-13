import React from 'react';
import { CARD_STYLE_BASE, CONTENT_BOX_STYLE } from '../../constants';
import WeatherSVG from '../common/WeatherSVG';

const WeatherForecastCard = ({ weather, onClick }) => {
  if (!weather) return null;
  return (
    <div
      style={{
        ...CARD_STYLE_BASE,
        display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', border: `2.5px solid ${weather.color}`
      }}
      onClick={onClick}
    >
      <div style={{ minWidth: 38, minHeight: 38, width: 38, height: 38, borderRadius: '50%', background: weather.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', marginRight: 16, boxShadow: `0 0 8px ${weather.color}55` }}>
        <WeatherSVG type={weather.type} animate={true} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ color: weather.color, fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 2 }}>气象预报系统</span>
        <div style={{ ...CONTENT_BOX_STYLE, fontSize: 15, color: weather.color, fontWeight: 600, minHeight: 24 }}>{weather.label}</div>
        <div style={{ fontSize: 13, color: '#b3cfff', marginTop: 2 }}>风险态势随数据实时变动</div>
        <div style={{ fontSize: 12, color: '#ffd666', marginTop: 4, fontWeight: 500 }}>[点击查看解读]</div>
      </div>
    </div>
  );
};

export default WeatherForecastCard; 