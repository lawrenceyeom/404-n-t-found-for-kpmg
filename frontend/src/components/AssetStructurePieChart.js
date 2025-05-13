import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { CARD_STYLE_BASE } from '../constants';

const AssetStructurePieChart = ({ financeData, assetItems }) => {
  const pieRef = useRef();
  useEffect(() => {
    if (!financeData || !financeData.length || !pieRef.current) return;
    const dom = pieRef.current;
    let pie = echarts.getInstanceByDom(dom) || echarts.init(dom);
    const pieData = assetItems.map(item => {
      const row = financeData.find(r => r.item && r.item.includes(item));
      return row ? { name: item, value: Number(row['2024']) || 0 } : null;
    }).filter(Boolean).filter(d => d.value > 0);
    const option = {
      backgroundColor: 'rgba(0,0,0,0)',
      title: {
        text: '资产结构分布',
        left: 'center',
        top: 10,
        textStyle: { color: '#40a9ff', fontWeight: 800, fontSize: 19 },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: '#223366',
        borderColor: '#40a9ff',
        textStyle: { color: '#fff' },
        formatter: p => `${p.marker} ${p.name}<br/>金额：${p.value.toLocaleString()}<br/>占比：${p.percent}%`,
      },
      legend: {
        orient: 'vertical',
        left: 10,
        top: 40,
        textStyle: { color: '#b3cfff', fontWeight: 700, fontSize: 14 },
      },
      series: [{
        name: '资产结构',
        type: 'pie',
        radius: ['38%', '70%'],
        center: ['55%', '55%'],
        data: pieData,
        label: {
          color: '#eaf6ff',
          fontWeight: 700,
          fontSize: 14,
          formatter: p => `${p.name}\n${p.percent}%`,
        },
        labelLine: { lineStyle: { color: '#40a9ff' } },
        itemStyle: {
          borderColor: '#162447',
          borderWidth: 2,
        },
        emphasis: {
          scale: true,
          itemStyle: { shadowBlur: 18, shadowColor: '#40a9ff88' },
        },
      }],
    };
    pie.setOption(option);
    pie.resize();
    const resize = () => pie && pie.resize();
    window.addEventListener('resize', resize);
    return () => { pie && dom && pie.dispose(); window.removeEventListener('resize', resize); };
  }, [financeData, assetItems]);
  return (
    <div style={{
      flex: 1,
      minWidth: 260,
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
      <div ref={pieRef} style={{ width: '100%', height: '100%', flex: 1 }} />
      {(!financeData || !financeData.length) && (
        <div style={{ color: '#ff5c5c', textAlign: 'center', marginTop: 18, fontWeight: 700, position: 'absolute' }}>暂无资产结构数据。</div>
      )}
    </div>
  );
};

export default AssetStructurePieChart; 