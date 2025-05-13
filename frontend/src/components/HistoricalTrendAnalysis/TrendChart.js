import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { calculateRatios } from '../../utils/chartUtils';

const TrendChart = ({ trendData, financeISData, trendPeriods, trendMode, trendMetricKeys, trendMetricMode, isLoading, onDrilldown }) => {
  const chartRef = useRef();

  // 分别查找资产负债表和利润表
  const findInTrendData = itemName => trendData.find(r => r.item === itemName || (r.item && r.item.includes(itemName)));
  const findInISData = itemName => financeISData.find(r => r.item === itemName || (r.item && r.item.includes(itemName)));

  useEffect(() => {
    if (!trendData || !trendData.length || !chartRef.current) return;
    const dom = chartRef.current;
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    // 计算比率
    const ratios = calculateRatios(trendData, financeISData, trendPeriods, findInTrendData, findInISData);
    console.log('Calculated Ratios:', JSON.parse(JSON.stringify(ratios)));
    // 动态series和legend
    const metricMap = {
      cash: { row: trendData.find(r => r.item && r.item.includes('货币资金')), label: '货币资金', color: '#40a9ff' },
      receivable: { row: trendData.find(r => r.item && r.item.includes('应收账款')), label: '应收账款', color: '#4be1a0' },
      debt: { row: trendData.find(r => r.item === '流动负债合计'), label: '流动负债', color: '#ff5c5c' },
      debt_ratio: { arr: ratios.debt_ratio, label: '资产负债率', color: '#ffd666', isRatio: true },
      current_ratio: { arr: ratios.current_ratio, label: '流动比率', color: '#a084ff', isRatio: true },
      quick_ratio: { arr: ratios.quick_ratio, label: '速动比率', color: '#ff8c40', isRatio: true },
      interest_debt_ratio: { arr: ratios.interest_debt_ratio, label: '有息负债占比', color: '#00e0e0', isRatio: true },
      roe: { arr: ratios.roe, label: '净资产收益率', color: '#ff8c40', isRatio: true },
      capital_accumulation_ratio: { arr: ratios.capital_accumulation_ratio, label: '资本积累率', color: '#ffd666', isRatio: true },
      main_net_profit_ratio: { arr: ratios.main_net_profit_ratio, label: '主营业务净利率', color: '#4be1a0', isRatio: true },
      asset_turnover: { arr: ratios.asset_turnover, label: '总资产周转率', color: '#ffd666', isRatio: true },
      receivable_turnover: { arr: ratios.receivable_turnover, label: '应收账款周转率', color: '#a084ff', isRatio: true },
      inventory_turnover: { arr: ratios.inventory_turnover, label: '存货周转率', color: '#ff8c40', isRatio: true },
    };
    // 动态series生成
    const series = trendMetricKeys.map(key => {
      const m = metricMap[key];
      if (!m) return null;
      let markPoint = undefined;
      if (m.isRatio) {
        let data = m.arr;
        let seriesData = data;
        if (trendMode === 'yoy' || trendMode === 'qoq' || trendMode === 'abnormal') {
          seriesData = data.map((v, i) => (i === 0 || !data[i-1] || !v || !data[i-1]) ? null : ((v - data[i-1]) / Math.abs(data[i-1]) * 100).toFixed(2));
          if (trendMode === 'abnormal') {
            markPoint = {
              data: seriesData.map((v, i) => {
                if (v == null) return null;
                const rate = Number(v);
                if (rate > 20 || rate < -20) {
                  return { name: '异常', value: v, xAxis: i, yAxis: v, itemStyle: { color: '#ff5c5c' } };
                }
                return null;
              }).filter(Boolean)
            };
          }
        }
        return {
          name: m.label,
          type: 'line',
          data: seriesData,
          smooth: true,
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 4, color: m.color },
          itemStyle: { color: m.color },
          emphasis: {
            focus: 'series',
            itemStyle: {
              symbolSize: 15,
              borderWidth: 2,
              borderColor: '#fff',
            }
          },
          markPoint,
          animation: true,
          animationDuration: 800,
          animationEasing: 'cubicOut',
        };
      } else {
        let row = m.row;
        let seriesData = trendPeriods.map(y => row && row[y] ? Number(row[y]) : null);
        if (trendMode === 'yoy' || trendMode === 'qoq' || trendMode === 'abnormal') {
          seriesData = seriesData.map((v, i) => (i === 0 || seriesData[i-1] == null || v == null) ? null : ((v - seriesData[i-1]) / Math.abs(seriesData[i-1]) * 100).toFixed(2));
          if (trendMode === 'abnormal') {
            markPoint = {
              data: seriesData.map((v, i) => {
                if (v == null) return null;
                const rate = Number(v);
                if (rate > 20 || rate < -20) {
                  return { name: '异常', value: v, xAxis: i, yAxis: v, itemStyle: { color: '#ff5c5c' } };
                }
                return null;
              }).filter(Boolean)
            };
          }
        }
        return {
          name: m.label,
          type: 'line',
          data: seriesData,
          smooth: true,
          symbol: 'circle',
          showSymbol: true,
          symbolSize: 8,
          lineStyle: { width: 4, color: m.color },
          itemStyle: { color: m.color },
          emphasis: {
            focus: 'series',
            itemStyle: {
              symbolSize: 15,
              borderWidth: 2,
              borderColor: '#fff',
            }
          },
          markPoint,
          animation: true,
          animationDuration: 800,
          animationEasing: 'cubicOut',
        };
      }
    }).filter(Boolean);
    const legendData = trendMetricKeys.map(k => metricMap[k]?.label).filter(Boolean);
    // 计算Y轴动态范围
    let allValues = [];
    series.forEach(s => {
      if (s.data) allValues = allValues.concat(s.data.filter(v => v !== null && v !== undefined).map(Number));
    });
    let minY = 0;
    if (allValues.length) {
      const minVal = Math.min(...allValues);
      if (minVal < 0) minY = Math.floor(minVal * 1.1);
    }
    const isRatioMode = trendMetricKeys.some(k => metricMap[k]?.isRatio);
    const isGrowthMode = trendMode === 'yoy' || trendMode === 'qoq' || trendMode === 'abnormal';
    chart.setOption({
      backgroundColor: 'rgba(0,0,0,0)',
      title: {
        text: '历史财务趋势分析',
        left: 'center',
        top: 10,
        textStyle: { color: '#40a9ff', fontWeight: 800, fontSize: 20 },
        subtext: trendMode === 'value' ? '多期对比，审计关注重点项目' : trendMode === 'yoy' ? '同比增长率，关注趋势变化' : trendMode === 'qoq' ? '环比增长率，关注短期波动' : '异常点高亮，辅助识别重大风险',
        subtextStyle: { color: '#b3cfff', fontWeight: 500, fontSize: 14 },
      },
      tooltip: { 
        trigger: 'axis', 
        backgroundColor: '#223366', 
        borderColor: '#40a9ff', 
        textStyle: { color: '#fff' },
        formatter: params => {
          return params.map(p => {
            let val = p.value;
            if (isGrowthMode) val = val == null ? '' : Number(val).toFixed(2) + '%';
            else if (isRatioMode) val = val == null ? '' : Number(val).toFixed(2) + '%';
            else val = (val === 0 ? '0' : val == null ? '' : (val / 10000).toLocaleString() + '万');
            return `${p.marker} ${p.seriesName}: ${val}`;
          }).join('<br/>');
        }
      },
      legend: {
        data: legendData,
        textStyle: { color: '#b3cfff', fontWeight: 700, fontSize: 13 },
        type: 'scroll',
        bottom: 10,
        left: 'center',
        itemWidth: 18,
        itemHeight: 12,
        icon: 'roundRect',
        selectedMode: true,
        tooltip: {
          show: true,
          formatter: name => {
            const idx = legendData.indexOf(name);
            if (idx === -1) return '';
            const s = series[idx];
            if (!s) return '';
            return trendPeriods.map((y, i) => `${y}: ${s.data[i] == null ? '-' : (isGrowthMode || isRatioMode ? Number(s.data[i]).toFixed(2) + '%' : (Number(s.data[i]) / 10000).toLocaleString() + '万')}`).join('<br/>');
          }
        },
      },
      grid: { left: 70, right: 30, top: 80, bottom: 60 },
      xAxis: {
        type: 'category',
        data: trendPeriods.map(y => y.replace('_Q1', '年Q1末')),
        axisLine: { lineStyle: { color: '#40a9ff' } },
        axisLabel: { color: '#eaf6ff', fontWeight: 700, fontSize: 15 },
      },
      yAxis: {
        type: 'value',
        min: minY,
        axisLine: { lineStyle: { color: '#40a9ff' } },
        splitLine: { lineStyle: { color: '#223366' } },
        axisLabel: {
          color: '#eaf6ff',
          fontWeight: 700,
          fontSize: 15,
          formatter: value => (isGrowthMode || isRatioMode ? (value == null ? '' : Number(value).toFixed(2) + '%') : (value === 0 ? '0' : value == null ? '' : (value / 10000).toLocaleString() + '万')),
        },
        name: isGrowthMode ? '增长率(%)' : isRatioMode ? '比率(%)' : '金额',
        nameTextStyle: { color: '#b3cfff', fontWeight: 700, fontSize: 15, align: 'center' },
      },
      series,
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
    });
    // 下钻事件
    chart.off('click');
    chart.on('click', params => {
      if (!params || !params.seriesName || params.dataIndex == null) return;
      const year = trendPeriods[params.dataIndex];
      const item = params.seriesName;
      console.log('Chart Click Params:', params);
      console.log('Calling onDrilldown with:', year, item);
      if (onDrilldown) {
        onDrilldown(year, item);
      }
    });
    const resize = () => chart && chart.resize();
    window.addEventListener('resize', resize);
    return () => { if (chart && dom) chart.dispose(); window.removeEventListener('resize', resize); };
  }, [trendData, financeISData, trendPeriods, trendMode, trendMetricKeys, trendMetricMode, onDrilldown]);

  return (
    <div style={{ width: '100%', height: 320, minWidth: 320, borderRadius: 12, background: 'rgba(16,43,106,0.12)' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
      {isLoading && <div style={{ color: '#b3cfff', textAlign: 'center', marginTop: 10 }}>数据加载中...</div>}
      {!isLoading && (!trendData || !trendData.length || !trendPeriods || !trendPeriods.length) && (
        <div style={{ color: '#ff5c5c', textAlign: 'center', marginTop: 18, fontWeight: 700 }}>暂无可用历史数据。</div>
      )}
    </div>
  );
};

export default TrendChart; 