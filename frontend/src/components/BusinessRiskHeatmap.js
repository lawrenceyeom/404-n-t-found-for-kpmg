import React, { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import { CARD_STYLE_BASE } from '../constants';

const BusinessRiskHeatmap = ({ company, bizModules, riskDimensions }) => {
  const heatmapRef = useRef();
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapMax, setHeatmapMax] = useState(100);

  useEffect(() => {
    // 不同公司风险基准
    const base = { aura: 20, beta: 40, crisis: 65 };
    const data = [];
    let max = 0;
    for (let i = 0; i < bizModules.length; i++) {
      for (let j = 0; j < riskDimensions.length; j++) {
        const val = Math.max(5, Math.min(100, Math.round(base[company] + i * 7 + j * 5 + Math.random() * 18 - 9)));
        data.push([j, i, val]);
        if (val > max) max = val;
      }
    }
    setHeatmapData(data);
    setHeatmapMax(Math.max(100, max));
  }, [company, bizModules, riskDimensions]);

  useEffect(() => {
    if (!heatmapData.length || !heatmapRef.current) return;
    const dom = heatmapRef.current;
    let heatmap = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const option = {
      backgroundColor: 'rgba(0,0,0,0)',
      title: {
        text: '分业务风险热力图',
        left: 'center',
        top: 10,
        textStyle: { color: '#40a9ff', fontWeight: 800, fontSize: 19 },
      },
      tooltip: {
        position: 'top',
        backgroundColor: '#223366',
        borderColor: '#40a9ff',
        textStyle: { color: '#fff' },
        formatter: p => {
          const [j, i, v] = p.data;
          return `${bizModules[i]}<br/>${riskDimensions[j].name}：<b style='color:#ffd666'>${v}</b>`;
        },
      },
      grid: { left: 80, right: 40, top: 70, bottom: 70 },
      xAxis: {
        type: 'category',
        data: riskDimensions.map(d => d.name),
        axisLabel: { color: '#b3cfff', fontWeight: 700, fontSize: 15 },
        axisLine: { lineStyle: { color: '#40a9ff' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: bizModules,
        axisLabel: { color: '#b3cfff', fontWeight: 700, fontSize: 15 },
        axisLine: { lineStyle: { color: '#40a9ff' } },
        splitLine: { show: false },
      },
      visualMap: {
        min: 0,
        max: heatmapMax,
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: 18,
        inRange: {
          color: ['#4be1a0', '#40a9ff', '#ffd666', '#ff5c5c'],
        },
        textStyle: { color: '#b3cfff', fontWeight: 700 },
      },
      series: [{
        name: '分业务风险',
        type: 'heatmap',
        data: heatmapData,
        label: { show: false },
        emphasis: {
          label: { show: true, color: '#fff', fontWeight: 700, fontSize: 13 },
          itemStyle: { shadowBlur: 10, shadowColor: '#40a9ff88' },
        },
      }],
    };
    heatmap.setOption(option);
    heatmap.resize();
    const resize = () => heatmap && heatmap.resize();
    window.addEventListener('resize', resize);
    return () => { heatmap && dom && heatmap.dispose(); window.removeEventListener('resize', resize); };
  }, [heatmapData, heatmapMax, bizModules, riskDimensions]);

  return (
    <div style={{
      flex: 1,
      minWidth: 320,
      height: 'clamp(340px, 28vw, 440px)',
      background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)',
      borderRadius: 18,
      boxShadow: '0 4px 24px #22336644',
      border: '2px solid #223366',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div ref={heatmapRef} style={{ width: '100%', height: '100%', flex: 1 }} />
    </div>
  );
};

export default BusinessRiskHeatmap; 