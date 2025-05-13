import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const RadarCard = ({ riskScores, RISK_DIMENSIONS, onRadarClick }) => {
  const radarRef = useRef();

  useEffect(() => {
    console.log('RadarCard useEffect triggered. riskScores:', riskScores);
    if (!riskScores || !riskScores.length || !radarRef.current) {
      console.log('RadarCard useEffect: Skipping render due to missing data or ref.');
      return;
    }
    let radar = echarts.getInstanceByDom(radarRef.current) || echarts.init(radarRef.current);
    radar.setOption({
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#223366',
        borderColor: '#40a9ff',
        textStyle: { color: '#fff' },
        formatter: params => {
          return RISK_DIMENSIONS.map((d, i) => `${d.name}：${riskScores[i].toFixed(1)}`).join('<br/>');
        }
      },
      radar: {
        indicator: RISK_DIMENSIONS.map((d, i) => ({ name: d.name, max: 100 })),
        splitLine: { lineStyle: { color: '#223366' } },
        splitArea: { areaStyle: { color: ['#162447cc', '#223366cc'] } },
        axisLine: { lineStyle: { color: '#40a9ff' } },
        name: { color: '#b3cfff', fontWeight: 700, fontSize: 15 },
      },
      series: [{
        name: '风险分布',
        type: 'radar',
        data: [{ value: riskScores, name: '风险分布' }],
        areaStyle: { color: 'rgba(64,169,255,0.25)' },
        lineStyle: { color: '#40a9ff', width: 3 },
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: {
          color: '#40a9ff',
          borderColor: '#40a9ff',
          borderWidth: 0,
        },
        emphasis: {
          itemStyle: {
            color: '#1e90ff',
            borderColor: '#ffd666',
            borderWidth: 4,
          },
        },
        label: { show: false },
        z: 3,
      }],
      animation: true,
      animationDuration: 300,
      animationDurationUpdate: 700,
      animationEasing: 'cubicInOut',
      animationEasingUpdate: 'cubicInOut',
    });
    radar.off('click');
    radar.on('click', params => {
      console.log('Radar click params:', params);
      console.log('Clicked dimension name from ECharts event:', params.name);
      let foundDimIdx = -1;
      RISK_DIMENSIONS.forEach((dim, index) => {
        console.log(`Comparing with RISK_DIMENSIONS[${index}].name: "${dim.name}"`);
        if (dim.name === params.name) {
          foundDimIdx = index;
        }
      });
      console.log('Found dimIdx:', foundDimIdx);
      if (foundDimIdx !== -1) {
        onRadarClick && onRadarClick(foundDimIdx, riskScores[foundDimIdx]);
      } else {
        console.error(`Dimension name "${params.name}" NOT FOUND in RISK_DIMENSIONS. Click event cannot be processed correctly.`);
      }
    });
    const resize = () => radar && radar.resize();
    window.addEventListener('resize', resize);
    return () => {
      radar && radar.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [riskScores, RISK_DIMENSIONS, onRadarClick]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={radarRef} />
  );
};

export default RadarCard; 