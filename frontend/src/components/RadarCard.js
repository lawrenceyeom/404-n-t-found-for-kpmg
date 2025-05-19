import React, { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts';

const RadarCard = ({ riskScores, RISK_DIMENSIONS, onRadarClick }) => {
  const radarRef = useRef();

  // Memoize the ECharts resize handler to prevent reattachment on each render
  const handleResize = useCallback(() => {
    if (radarRef.current) {
      const radar = echarts.getInstanceByDom(radarRef.current);
      if (radar && !radar.isDisposed()) {
        radar.resize();
      }
    }
  }, []);

  useEffect(() => {
    // console.log('RadarCard useEffect triggered. riskScores:', riskScores, 'RISK_DIMENSIONS:', RISK_DIMENSIONS, 'onRadarClick:', onRadarClick);
    if (!riskScores || !riskScores.length || !RISK_DIMENSIONS || !RISK_DIMENSIONS.length || !radarRef.current) {
      // console.log('RadarCard useEffect: Skipping render due to missing data or ref.');
      // Clear previous instance if ref exists but data is gone
      if (radarRef.current) {
        const existingInstance = echarts.getInstanceByDom(radarRef.current);
        if (existingInstance && !existingInstance.isDisposed()) {
          existingInstance.dispose();
        }
      }
      return;
    }

    let radar = echarts.getInstanceByDom(radarRef.current);
    if (!radar || radar.isDisposed()) { // Check if disposed before init
        radar = echarts.init(radarRef.current);
    }
    
    radar.setOption({
      backgroundColor: 'rgba(0,0,0,0)',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#223366',
        borderColor: '#40a9ff',
        textStyle: { color: '#fff' },
        formatter: params => {
          return RISK_DIMENSIONS.map((d, i) => 
            `${d.name}：${(riskScores[i] !== undefined && riskScores[i] !== null) ? riskScores[i].toFixed(1) : 'N/A'}`
          ).join('<br/>');
        }
      },
      radar: {
        indicator: RISK_DIMENSIONS.map(d => ({ name: d.name, max: 100 })),
        splitLine: { lineStyle: { color: '#223366' } },
        splitArea: { areaStyle: { color: ['rgba(22,36,71,0.8)', 'rgba(34,51,102,0.8)'] } },
        axisLine: { lineStyle: { color: '#40a9ff' } },
        name: { color: '#b3cfff', fontWeight: 700, fontSize: 15 },
      },
      series: [{
        name: '风险分布',
        type: 'radar',
        data: [{ value: riskScores, name: '风险分布' }],
        areaStyle: { color: 'rgba(64,169,255,0.35)' },
        lineStyle: { color: '#40a9ff', width: 3 },
        symbol: 'circle',
        symbolSize: 10,
        itemStyle: {
          color: '#40a9ff',
        },
        emphasis: {
          itemStyle: {
            color: '#1e90ff',
            borderColor: '#ffd666',
            borderWidth: 3,
          },
          areaStyle: { color: 'rgba(64,169,255,0.5)'},
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

    // Set up the click handler
    radar.off('click'); 
    radar.on('click', params => {
      let foundDimIdx = -1;
      const clickedName = params.name; 
      const radarIndicatorIndex = params.radarIndicatorIndex;

      if (clickedName) {
        foundDimIdx = RISK_DIMENSIONS.findIndex(dim => dim.name === clickedName);
      } else if (typeof radarIndicatorIndex === 'number') { 
        foundDimIdx = radarIndicatorIndex;
      }
      
      if (foundDimIdx !== -1 && foundDimIdx < RISK_DIMENSIONS.length) {
        onRadarClick && onRadarClick(foundDimIdx);
      } else {
        console.error(`RadarCard: Clicked dimension (Name: "${clickedName}", EChartsIndex: ${radarIndicatorIndex}) could not be reliably mapped.`, params);
      }
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Dispose when the component unmounts or when dependencies force a full re-init.
      // The logic at the start of useEffect handles disposal if data becomes invalid.
      // If onRadarClick reference changes, ECharts re-initializes, which is fine.
      if (radar && !radar.isDisposed()) {
        radar.dispose();
      }
    };
  }, [riskScores, RISK_DIMENSIONS, onRadarClick, handleResize]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={radarRef} />
  );
};

// Custom equality comparison function for React.memo
// Only re-render if the data values actually changed, not just the function references
function arePropsEqual(prevProps, nextProps) {
  // Compare riskScores arrays by value
  if (prevProps.riskScores?.length !== nextProps.riskScores?.length) {
    return false;
  }
  
  if (prevProps.riskScores) {
    for (let i = 0; i < prevProps.riskScores.length; i++) {
      if (prevProps.riskScores[i] !== nextProps.riskScores[i]) {
        return false;
      }
    }
  }
  
  // Compare RISK_DIMENSIONS array length
  if (prevProps.RISK_DIMENSIONS?.length !== nextProps.RISK_DIMENSIONS?.length) {
    return false;
  }
  
  // We won't do a deep comparison of RISK_DIMENSIONS objects
  // since they should be constant and not changing frequently
  
  // For onRadarClick, we only care if it exists in both props
  // since we don't want to re-render just because the function reference changed
  const prevHasClick = Boolean(prevProps.onRadarClick);
  const nextHasClick = Boolean(nextProps.onRadarClick);
  
  return prevHasClick === nextHasClick;
}

export default React.memo(RadarCard, arePropsEqual);