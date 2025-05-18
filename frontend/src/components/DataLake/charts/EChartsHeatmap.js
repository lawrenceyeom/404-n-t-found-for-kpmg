import React, { useMemo, memo } from 'react';
import * as echarts from 'echarts';
import EChartsBase from './EChartsBase';

const EChartsHeatmap = ({ title, xData, yData, data, min, max }) => {
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: title ? {
      text: title,
      left: 'center',
      top: 10,
      textStyle: { color: '#4be1a0', fontWeight: 700, fontSize: 18 }
    } : undefined,
    tooltip: {
      position: 'top',
      backgroundColor: '#15294e',
      borderColor: '#4be1a0',
      textStyle: { color: '#eaf6ff' },
      formatter: function (params) {
        return `${xData[params.data[0]]}, ${yData[params.data[1]]}<br>热度: ${params.data[2]}`;
      }
    },
    grid: {
      top: 60,
      bottom: 60,
      left: 80,
      right: 60
    },
    xAxis: {
      type: 'category',
      data: xData,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(21, 41, 78, 0.95)', 'rgba(21, 41, 78, 0.8)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#4be1a0'
        }
      },
      axisLabel: {
        color: '#b3cfff'
      }
    },
    yAxis: {
      type: 'category',
      data: yData,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(21, 41, 78, 0.95)', 'rgba(21, 41, 78, 0.8)']
        }
      },
      axisLine: {
        lineStyle: {
          color: '#4be1a0'
        }
      },
      axisLabel: {
        color: '#b3cfff'
      }
    },
    visualMap: {
      min: min || 0,
      max: max || 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 10,
      textStyle: { 
        color: '#b3cfff' 
      },
      inRange: {
        color: [
          '#1e3a6d',
          '#40a9ff',
          '#4be1a0'
        ]
      }
    },
    series: [{
      name: title || '热力图',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }), [title, xData, yData, data, min, max]);
  
  return <EChartsBase option={option} />;
};

export default memo(EChartsHeatmap); 