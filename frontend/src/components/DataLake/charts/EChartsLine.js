import React, { useMemo, memo } from 'react';
import EChartsBase from './EChartsBase';

const EChartsLine = ({ title, xData, series, legend, colors }) => {
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: title ? {
      text: title,
      left: 'center',
      top: 10,
      textStyle: { color: '#4be1a0', fontWeight: 700, fontSize: 18 }
    } : undefined,
    tooltip: { 
      trigger: 'axis', 
      backgroundColor: '#15294e', 
      borderColor: '#4be1a0', 
      textStyle: { color: '#eaf6ff' } 
    },
    legend: legend ? { 
      data: legend, 
      top: 36, 
      textStyle: { color: '#b3cfff' } 
    } : undefined,
    grid: { left: 40, right: 24, top: 60, bottom: 40 },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#4be1a0' } },
      axisLabel: { color: '#b3cfff' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4be1a0' } },
      splitLine: { lineStyle: { color: '#2a3c6e' } },
      axisLabel: { color: '#b3cfff' }
    },
    color: colors || ['#4be1a0', '#40a9ff', '#ffd666', '#ff5c5c'],
    series: series.map(s => ({
      ...s,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3 },
      itemStyle: { borderWidth: 2 }
    }))
  }), [title, xData, series, legend, colors]);
  
  return <EChartsBase option={option} />;
};

export default memo(EChartsLine); 