import { useState, useEffect } from 'react';

export default function useAlerts(riskScores, API_BASE, company, RISK_DIMENSIONS) {
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [currentAlertIdx, setCurrentAlertIdx] = useState(0);
  const [alertHistory, setAlertHistory] = useState([]);
  const [isAlertHistoryOpen, setIsAlertHistoryOpen] = useState(false);
  const [alertDetailData, setAlertDetailData] = useState(null);

  // 生成动态预警假数据
  useEffect(() => {
    const risk = Math.max(...riskScores);
    let level = '低';
    let color = '#4be1a0';
    if (risk > 60) { level = '高'; color = '#ff5c5c'; }
    else if (risk > 35) { level = '中'; color = '#ffd666'; }
    const fakeAlerts = [
      { level, color, time: new Date().toLocaleTimeString(), msg: `${level}风险：${RISK_DIMENSIONS[riskScores.indexOf(risk)].name}异常波动`, dim: RISK_DIMENSIONS[riskScores.indexOf(risk)].name },
      { level: '中', color: '#ffd666', time: new Date(Date.now() - 60000).toLocaleTimeString(), msg: '运营风险指标临近阈值', dim: '运营风险' },
      { level: '低', color: '#4be1a0', time: new Date(Date.now() - 120000).toLocaleTimeString(), msg: '合规风险持续平稳', dim: '合规风险' },
    ];
    setCurrentAlerts(fakeAlerts);
    setCurrentAlertIdx(0);
  }, [riskScores, RISK_DIMENSIONS]);

  // 预警轮播
  useEffect(() => {
    if (!currentAlerts.length) return;
    const interval = setInterval(() => {
      setCurrentAlertIdx(idx => (idx + 1) % currentAlerts.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentAlerts]);

  // 拉取历史预警
  useEffect(() => {
    fetch(`${API_BASE}/alerts/history?company=${company}`)
      .then(res => res.json())
      .then(data => setAlertHistory(data || []));
  }, [company, API_BASE]);

  // 详情弹窗控制
  const openAlertHistoryModal = () => setIsAlertHistoryOpen(true);
  const closeAlertHistoryModal = () => setIsAlertHistoryOpen(false);
  const openAlertDetail = (id) => {
    fetch(`${API_BASE}/alerts/detail?id=${id}`)
      .then(res => res.json())
      .then(data => setAlertDetailData(data));
  };
  const closeAlertDetail = () => setAlertDetailData(null);

  return {
    currentAlerts,
    currentAlertIdx,
    alertHistory,
    isAlertHistoryOpen,
    openAlertHistoryModal,
    closeAlertHistoryModal,
    alertDetailData,
    openAlertDetail,
    closeAlertDetail,
  };
} 