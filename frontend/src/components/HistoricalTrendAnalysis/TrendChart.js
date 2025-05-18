import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { calculateRatios } from '../../utils/chartUtils';

const TrendChart = ({ trendData, financeISData, trendPeriods, trendMode, trendMetricKeys, trendMetricMode, isLoading, onDrilldown }) => {
  const chartRef = useRef();

  // 分别查找资产负债表和利润表
  const findInTrendData = itemName => {
    if (Array.isArray(trendData)) {
      return trendData.find(r => r.item === itemName || (r.item && r.item.includes(itemName)));
    }
    return null;
  };
  
  // 添加一个更灵活的查找函数，可以查找包含关键词的项目
  const findInTrendDataFlexible = (keywords) => {
    if (!Array.isArray(trendData)) return null;
    // 尝试按完全匹配，然后逐步放宽匹配条件
    for (const keyword of keywords) {
      // 精确匹配
      const exactMatch = trendData.find(r => r.item === keyword);
      if (exactMatch) return exactMatch;
      
      // 包含匹配
      const containsMatch = trendData.find(r => r.item && r.item.includes(keyword));
      if (containsMatch) return containsMatch;
    }
    return null;
  };
  
  const findInISData = itemName => financeISData.find(r => r.item === itemName || (r.item && r.item.includes(itemName)));

  useEffect(() => {
    if (!trendData || (!Array.isArray(trendData) && Object.keys(trendData).length === 0) || !chartRef.current) return;
    const dom = chartRef.current;
    let chart = echarts.getInstanceByDom(dom) || echarts.init(dom);
    // 计算比率
    const ratios = calculateRatios(trendData, financeISData, trendPeriods, findInTrendData, findInISData);
    console.log('Calculated Ratios:', JSON.parse(JSON.stringify(ratios)));
    
    // 动态series和legend
    const metricMap = {
      // Asset items
      cash: { row: findInTrendData('货币资金'), label: '货币资金', color: '#40a9ff' },
      receivable: { 
        row: findInTrendDataFlexible(['应收账款', '应收款项', '应收票据']), 
        label: '应收账款', 
        color: '#4be1a0',
        fallbackRows: [findInTrendData('长期应收款'), findInTrendData('其他应收款')]
      },
      inventory: { row: findInTrendData('存货'), label: '存货', color: '#ffd666' },
      fixed_assets: { row: findInTrendData('固定资产'), label: '固定资产', color: '#ff8c40' },
      construction: { row: findInTrendData('在建工程'), label: '在建工程', color: '#a084ff' },
      intangible: { row: findInTrendData('无形资产'), label: '无形资产', color: '#00e0e0' },
      investment_property: { row: findInTrendData('投资性房地产'), label: '投资性房地产', color: '#ff5c5c' },
      long_term_equity: { row: findInTrendData('长期股权投资'), label: '长期股权投资', color: '#ff7a5c' },
      other_receivables: { row: findInTrendData('其他应收款'), label: '其他应收款', color: '#5cffb5' },
      total_current_assets: { row: findInTrendData('流动资产合计'), label: '流动资产合计', color: '#ff5c5c' },
      total_assets: { row: findInTrendData('资产总计'), label: '资产总计', color: '#ff8f5c' },
      
      // Liability items
      short_borrowings: { row: findInTrendData('短期借款'), label: '短期借款', color: '#ff5c79' },
      accounts_payable: { 
        row: findInTrendDataFlexible(['应付账款', '应付款项', '应付票据']), 
        label: '应付账款', 
        color: '#ff5ca8',
        fallbackRows: [findInTrendData('其他应付款')]
      },
      contract_liabilities: { row: findInTrendData('合同负债'), label: '合同负债', color: '#d15cff' },
      long_borrowings: { row: findInTrendData('长期借款'), label: '长期借款', color: '#915cff' },
      bonds_payable: { row: findInTrendData('应付债券'), label: '应付债券', color: '#5c7dff' },
      debt: { row: findInTrendData('流动负债合计'), label: '流动负债合计', color: '#5cbdff' },
      non_current_liabilities: { row: findInTrendData('非流动负债合计'), label: '非流动负债合计', color: '#5cffef' },
      total_liabilities: { row: findInTrendData('负债合计'), label: '负债合计', color: '#5cff9a' },
      
      // Equity items
      share_capital: { row: findInTrendData('实收资本（或股本）'), label: '实收资本（或股本）', color: '#adff5c' },
      capital_reserve: { row: findInTrendData('资本公积'), label: '资本公积', color: '#eeff5c' },
      surplus_reserve: { row: findInTrendData('盈余公积'), label: '盈余公积', color: '#ffb45c' },
      undistributed_profit: { row: findInTrendData('未分配利润'), label: '未分配利润', color: '#ff755c' },
      total_equity: { row: findInTrendData('所有者权益合计'), label: '所有者权益合计', color: '#ff5c8e' },
      
      // Income statement items
      revenue: { row: findInISData('一、营业总收入'), label: '营业收入', color: '#5ca2ff' },
      operating_costs: { row: findInISData('其中：营业成本'), label: '营业成本', color: '#ff5c5c' },
      operating_profit: { row: findInISData('营业利润'), label: '营业利润', color: '#5cffe3' },
      total_profit: { row: findInISData('利润总额'), label: '利润总额', color: '#5cffa2' },
      net_profit: { row: findInISData('净利润'), label: '净利润', color: '#a0ff5c' },
      
      // Legacy asset properties with non-key names
      '投资性房地产': { row: findInTrendData('投资性房地产'), label: '投资性房地产', color: '#ffd666' },
      '长期应收款': { row: findInTrendData('长期应收款'), label: '长期应收款', color: '#a084ff' },
      
      // Financial ratios
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

      // 特殊处理：检查应收账款和应付账款
      if ((key === 'receivable' || key === 'accounts_payable') && 
          (!m.row || !Object.values(m.row).some(v => v !== null && v !== undefined && v !== 'item' && v !== 'aux'))) {
        // 尝试使用备选数据
        const fallbacks = m.fallbackRows || [];
        for (const fallbackRow of fallbacks) {
          if (fallbackRow && Object.values(fallbackRow).some(v => v !== null && v !== undefined && v !== 'item' && v !== 'aux')) {
            console.log(`找到备选数据行: ${fallbackRow.item}`);
            m.row = fallbackRow;
            break;
          }
        }
      }

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
        
        // 没有找到有效数据，显示警告
        if (!row || !Object.values(row).some(v => v !== null && v !== undefined && v !== 'item' && v !== 'aux')) {
          console.warn(`未找到项目 ${m.label} 的数据`);
        }
        
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
      {!isLoading && (!trendData || 
        (Array.isArray(trendData) && trendData.length === 0) || 
        (!Array.isArray(trendData) && Object.keys(trendData).length === 0) || 
        !trendPeriods || !trendPeriods.length) && (
        <div style={{ color: '#ff5c5c', textAlign: 'center', marginTop: 18, fontWeight: 700 }}>暂无可用历史数据。</div>
      )}
    </div>
  );
};

export default TrendChart; 