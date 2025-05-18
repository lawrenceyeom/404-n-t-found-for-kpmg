import React, { useMemo, memo } from 'react';
import * as echarts from 'echarts';
import EChartsBase from './EChartsBase';

const EChartsFeatureBar = ({ features, title }) => {
  // 使用useMemo记忆化排序后的特征
  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => (b.importance || 0) - (a.importance || 0));
  }, [features]);
  
  // 使用useMemo记忆化option对象
  const option = useMemo(() => {
    return {
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
        textStyle: { color: '#eaf6ff' },
        formatter: (params) => {
          const feature = params[0];
          const value = features.find(f => f.name === feature.name).value;
          return `${feature.name}<br>重要性: ${(feature.value * 100).toFixed(1)}%<br>值: ${value !== undefined ? value : '无数据'}`;
        }
      },
      grid: { left: 120, right: 24, top: 60, bottom: 40 },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4be1a0' } },
        splitLine: { lineStyle: { color: '#2a3c6e' } },
        axisLabel: { color: '#b3cfff' }
      },
      yAxis: {
        type: 'category',
        data: sortedFeatures.map(f => f.name),
        axisLine: { lineStyle: { color: '#4be1a0' } },
        axisLabel: { color: '#b3cfff' }
      },
      series: [{
        type: 'bar',
        barMaxWidth: 20,
        data: sortedFeatures.map(f => f.importance || 0),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#4be1a0' },
            { offset: 1, color: '#40a9ff' }
          ]),
          borderRadius: [0, 5, 5, 0]
        }
      }]
    };
  }, [sortedFeatures, features, title]);
  
  return <EChartsBase option={option} />;
};

export default memo(EChartsFeatureBar); 