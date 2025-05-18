import React, { useMemo, memo } from 'react';
import EChartsBase from './EChartsBase';

const EChartsPie = ({ title, data, colors }) => {
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: title ? {
      text: title,
      left: 'center',
      top: 10,
      textStyle: { color: '#4be1a0', fontWeight: 700, fontSize: 18 }
    } : undefined,
    tooltip: {
      trigger: 'item',
      backgroundColor: '#15294e',
      borderColor: '#4be1a0',
      textStyle: { color: '#eaf6ff' },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#b3cfff' }
    },
    color: colors || ['#4be1a0', '#40a9ff', '#ffd666', '#ff5c5c', '#8f91ff'],
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderWidth: 2,
          borderColor: '#15294e'
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }), [title, data, colors]);
  
  return <EChartsBase option={option} />;
};

export default memo(EChartsPie); 