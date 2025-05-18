import React, { useMemo, memo } from 'react';
import EChartsBase from './EChartsBase';

const EChartsRadar = ({ title, data, indicator, colors }) => {
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
      textStyle: { color: '#eaf6ff' }
    },
    legend: {
      bottom: 5,
      textStyle: { color: '#b3cfff' }
    },
    radar: {
      indicator: indicator,
      splitArea: {
        areaStyle: {
          color: ['rgba(21, 41, 78, 0.8)', 'rgba(21, 41, 78, 0.6)', 'rgba(21, 41, 78, 0.4)', 'rgba(21, 41, 78, 0.2)'],
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          shadowBlur: 10
        }
      },
      axisLine: {
        lineStyle: {
          color: '#2a3c6e'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#2a3c6e'
        }
      },
      name: {
        textStyle: {
          color: '#b3cfff'
        }
      }
    },
    color: colors || ['#4be1a0', '#40a9ff', '#ffd666'],
    series: data.map(item => ({
      name: item.name || title,
      type: 'radar',
      data: [
        {
          value: item.value,
          name: item.name || '指标',
          areaStyle: {
            opacity: 0.3
          },
          lineStyle: {
            width: 2
          }
        }
      ]
    }))
  }), [title, data, indicator, colors]);
  
  return <EChartsBase option={option} />;
};

export default memo(EChartsRadar); 