import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

const OpinionMiniCards = ({ trendData, platformStat, hotEvents }) => {
  const trendRef = useRef();
  const platformPieRef = useRef();
  useEffect(() => {
    if (!trendData.length || !trendRef.current) return;
    const dom = trendRef.current;
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const option = {
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: { trigger: 'axis', backgroundColor: '#223366', borderColor: '#40a9ff', textStyle: { color: '#fff' } },
      legend: { data: ['正面', '中性', '负面'], textStyle: { color: '#b3cfff', fontWeight: 700 }, top: 10 },
      grid: { left: 30, right: 20, top: 40, bottom: 30 },
      xAxis: {
        type: 'category',
        data: trendData.map(d => d.date),
        axisLine: { lineStyle: { color: '#40a9ff' } },
        axisLabel: { color: '#eaf6ff', fontWeight: 700, fontSize: 13 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { lineStyle: { color: '#40a9ff' } },
        splitLine: { lineStyle: { color: '#223366' } },
        axisLabel: { color: '#eaf6ff', fontWeight: 700, fontSize: 13 },
      },
      series: [
        { name: '正面', type: 'line', data: trendData.map(d => d.positive), smooth: true, lineStyle: { color: '#4be1a0', width: 3 }, itemStyle: { color: '#4be1a0' } },
        { name: '中性', type: 'line', data: trendData.map(d => d.neutral), smooth: true, lineStyle: { color: '#ffd666', width: 3 }, itemStyle: { color: '#ffd666' } },
        { name: '负面', type: 'line', data: trendData.map(d => d.negative), smooth: true, lineStyle: { color: '#ff5c5c', width: 3 }, itemStyle: { color: '#ff5c5c' } },
      ],
    };
    chart.setOption(option);
    chart.resize();
    const resize = () => chart && chart.resize();
    window.addEventListener('resize', resize);
    return () => { if (chart && dom) chart.dispose(); window.removeEventListener('resize', resize); };
  }, [trendData]);
  useEffect(() => {
    if (!platformStat.length || !platformPieRef.current) return;
    const dom = platformPieRef.current;
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const option = {
      tooltip: { trigger: 'item' },
      legend: { left: 'center', bottom: 10, textStyle: { color: '#b3cfff', fontWeight: 700 } },
      series: [{
        name: '平台分布',
        type: 'pie',
        radius: ['38%', '70%'],
        center: ['50%', '45%'],
        data: platformStat.map(p => ({ name: p.platform, value: p.count })),
        label: { color: '#eaf6ff', fontWeight: 700, fontSize: 13 },
        labelLine: { lineStyle: { color: '#40a9ff' } },
        itemStyle: { borderColor: '#162447', borderWidth: 2 },
        emphasis: { scale: true, itemStyle: { shadowBlur: 18, shadowColor: '#40a9ff88' } },
      }],
    };
    chart.setOption(option);
    chart.resize();
    const resize = () => chart && chart.resize();
    window.addEventListener('resize', resize);
    return () => { if (chart && dom) chart.dispose(); window.removeEventListener('resize', resize); };
  }, [platformStat]);
  return (
    <div style={{ display: 'flex', gap: 28, margin: '32px 0 0 0', width: '100%' }}>
      <div style={{ flex: 1, minWidth: 0, background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)', borderRadius: 14, boxShadow: '0 2px 10px #22336622', border: '1px solid #223366', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260 }}>
        <div style={{ color: '#40a9ff', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>舆情趋势分析</div>
        <div ref={trendRef} style={{ width: '100%', height: 180, minWidth: 0 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)', borderRadius: 14, boxShadow: '0 2px 10px #22336622', border: '1px solid #223366', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260 }}>
        <div style={{ color: '#40a9ff', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>平台分布</div>
        <div ref={platformPieRef} style={{ width: '100%', height: 180, minWidth: 0 }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)', borderRadius: 14, boxShadow: '0 2px 10px #22336622', border: '1px solid #223366', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 260, overflow: 'auto' }}>
        <div style={{ color: '#40a9ff', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>舆情风暴（爆点）</div>
        <div style={{ width: '100%', maxHeight: 180, overflowY: 'auto' }}>
          {(!hotEvents || hotEvents.length === 0) && <div style={{ color: '#b3cfff', fontWeight: 600, textAlign: 'center', marginTop: 30 }}>暂无爆点</div>}
          {hotEvents && hotEvents.map(ev => (
            <div key={ev.date} style={{ margin: '10px 0', background: '#223366', borderRadius: 8, padding: '10px 18px', boxShadow: '0 2px 8px #ff5c5c22', maxWidth: '100%' }}>
              <span style={{ color: '#ff5c5c', fontWeight: 900, marginRight: 10 }}>●</span>
              {ev.date}：{ev.desc}（负面{ev.count}条）
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OpinionMiniCards; 