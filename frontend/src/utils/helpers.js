import { RISK_DIMENSIONS } from '../constants';

export function getWeatherByRisk(riskScores) {
  const max = Math.max(...riskScores);
  const dims = RISK_DIMENSIONS.map(d => d.name);
  const highDims = riskScores.map((v, i) => v > 60 ? dims[i] : null).filter(Boolean);
  const midDims = riskScores.map((v, i) => v > 35 && v <= 60 ? dims[i] : null).filter(Boolean);

  if (max > 80 && highDims.length > 2) {
    return { type: 'typhoon', label: '台风', color: '#ff5c5c', explain: `多维重大风险（${highDims.join('、')}），需专项审计。`, advice: '建议立即组织专项风险排查。' };
  }
  if (max > 60) {
    if (highDims.includes('舆情风险')) return { type: 'wind', label: '大风', color: '#40a9ff', explain: '舆情风险突出，外部影响大。', advice: '建议关注媒体与社交平台动态。' };
    if (highDims.includes('合规风险')) return { type: 'storm', label: '雷阵雨', color: '#ffd666', explain: '合规风险高，存在违规隐患。', advice: '建议重点复核合规事项。' };
    return { type: 'storm', label: '雷阵雨', color: '#ffd666', explain: `重大风险（${highDims.join('、')}），需重点关注。`, advice: '建议立即排查高风险领域。' };
  }
  if (midDims.length > 0) {
    return { type: 'cloudy', label: '多云', color: '#40a9ff', explain: `中等风险（${midDims.join('、')}），需持续关注。`, advice: '建议定期复核相关领域。' };
  }
  return { type: 'sunny', label: '晴天', color: '#4be1a0', explain: '整体风险可控。', advice: '建议保持常规审计关注。' };
}

export const findRow = (data, name) => data.find(r => r.item === name || (r.item && r.item.includes(name)));

export const getBaseRiskScores = (company, opinionList) => {
  let opinionRisk = 20;
  if (opinionList && opinionList.length) {
    const neg = opinionList.filter(op => op.sentiment === 'negative').length;
    const pos = opinionList.filter(op => op.sentiment === 'positive').length;
    const total = opinionList.length;
    if (total > 0) {
      opinionRisk = Math.round((neg / total) * 80 + (1 - pos / total) * 20);
    }
  }
  let operationRisk = 25;
  const baseScoresTemplate = {
    aura: [25, null, operationRisk, 12, 15, 10],
    beta: [40, null, operationRisk + 8, 18, 22, 15],
    crisis: [70, null, operationRisk + 18, 30, 35, 25],
  };
  const scores = [...baseScoresTemplate[company]];
  scores[1] = opinionRisk;
  if (company === 'beta') {
    scores[2] = Math.min(100, Math.max(0, operationRisk + 8));
  } else if (company === 'crisis') {
    scores[2] = Math.min(100, Math.max(0, operationRisk + 18));
  }
  return scores.map(score => Math.min(100, Math.max(0, Math.round(score))));
};

export const formatOpinionDate = (dateString) => {
  if (!dateString) return '';
  if (!/\d{2}:\d{2}/.test(dateString)) {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    return `${dateString} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  return dateString;
}; 