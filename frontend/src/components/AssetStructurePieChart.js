import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { CARD_STYLE_BASE } from '../constants';

const AssetStructurePieChart = ({ financeData, assetItems }) => {
  const pieRef = useRef();
  useEffect(() => {
    if (!financeData || !financeData.length || !pieRef.current) return;
    const dom = pieRef.current;
    let pie = echarts.getInstanceByDom(dom) || echarts.init(dom);
    
    // Find the latest period with data
    const availablePeriods = Object.keys(financeData[0] || {})
      .filter(key => key !== 'item' && key !== 'aux')
      .sort((a, b) => {
        // Sort periods in reverse order to get latest first
        // Handle year and quarter notations
        const aYear = a.includes('_') ? a.split('_')[0] : a;
        const bYear = b.includes('_') ? b.split('_')[0] : b;
        return parseInt(bYear) - parseInt(aYear);
      });
    
    const latestPeriod = availablePeriods[0] || '2024';
    console.log('Asset Structure using period:', latestPeriod);
    
    // Function to find the row by item name including partial matches
    const findItemRow = (itemName) => {
      return financeData.find(r => r.item && (
        r.item === itemName || 
        r.item.includes(itemName) || 
        itemName.includes(r.item)
      ));
    };
    
    // Find all asset items that have values
    const pieData = [];
    
    // First try the exact asset items passed in
    for (const item of assetItems) {
      const row = findItemRow(item);
      if (row && row[latestPeriod] && Number(row[latestPeriod]) > 0) {
        pieData.push({
          name: item,
          value: Number(row[latestPeriod])
        });
      }
    }
    
    // If we didn't get enough items, try to find more asset items in the data
    if (pieData.length < 3) {
      const additionalAssetNames = [
        '投资性房地产', '长期应收款', '交易性金融资产', '预付款项',
        '其他非流动资产', '长期待摊费用', '商誉', '递延所得税资产'
      ];
      
      for (const item of additionalAssetNames) {
        if (!assetItems.includes(item)) {
          const row = findItemRow(item);
          if (row && row[latestPeriod] && Number(row[latestPeriod]) > 0) {
            pieData.push({
              name: item,
              value: Number(row[latestPeriod])
            });
          }
        }
      }
    }
    
    // Filter out the items with 0 value (should be redundant now)
    const validPieData = pieData.filter(d => d.value > 0);
    
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
        data: validPieData,
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