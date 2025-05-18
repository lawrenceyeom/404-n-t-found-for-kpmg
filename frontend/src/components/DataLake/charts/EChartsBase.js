import React, { useRef, useEffect, memo } from 'react';
import * as echarts from 'echarts';

const isEqual = (prevProps, nextProps) => {
  if (!prevProps.option || !nextProps.option) return false;
  // 深度比较option对象，简化版
  return JSON.stringify(prevProps.option) === JSON.stringify(nextProps.option);
};

const EChartsBase = ({ option, style = {}, className = '' }) => {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current, 'dark');
    }
    const chart = instanceRef.current;
    chart.setOption(option, true);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      chart.dispose();
      instanceRef.current = null;
    };
  }, [option]);

  return (
    <div
      ref={chartRef}
      className={className}
      style={{ width: '100%', height: 320, minHeight: 240, ...style, background: 'transparent' }}
    />
  );
};

export default memo(EChartsBase, isEqual); 