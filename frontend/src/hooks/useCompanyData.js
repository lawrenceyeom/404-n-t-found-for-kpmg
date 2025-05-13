import { useState, useEffect } from 'react';
import { BIZ_MODULES_MAP, INITIAL_RISK_SCORES } from '../constants';

// 简单的数组内容比较函数
const arraysAreEqual = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
};

export const useCompanyData = (company, opinionList, isLoadingOpinion, riskDimensions, getWeatherByRiskFunc, getBaseRiskScoresFunc) => {
  const [riskScores, setRiskScores] = useState(INITIAL_RISK_SCORES);
  const [bizModules, setBizModules] = useState(BIZ_MODULES_MAP[company] || BIZ_MODULES_MAP['aura']);
  const [weather, setWeather] = useState({ type: 'sunny', label: '晴天', color: '#4be1a0', explain: '', advice: '' });

  useEffect(() => {
    setBizModules(BIZ_MODULES_MAP[company] || BIZ_MODULES_MAP['aura']);
  }, [company]);

  useEffect(() => {
    if (!isLoadingOpinion && company && opinionList && opinionList.length > 0) {
      console.log(`useCompanyData: company or opinionList changed and not loading. Company: ${company}, OpinionList length: ${opinionList.length}. About to calculate newBaseScores.`);
      const newBaseScores = getBaseRiskScoresFunc(company, opinionList);
      setRiskScores(prevScores => {
        if (!arraysAreEqual(prevScores, newBaseScores)) {
          console.log('useCompanyData: Setting new riskScores:', newBaseScores);
          return newBaseScores;
        }
        console.log('useCompanyData: riskScores content is the same, not updating reference.');
        return prevScores;
      });
    } else if (isLoadingOpinion || (opinionList && opinionList.length === 0)) {
      console.log('useCompanyData: Waiting for valid opinionList or opinionList is empty, skipping riskScores update.');
    }
  }, [company, opinionList, isLoadingOpinion, getBaseRiskScoresFunc]);

  useEffect(() => {
    console.log('useCompanyData: riskScores changed for weather update. New riskScores:', riskScores);
    setWeather(getWeatherByRiskFunc(riskScores));
  }, [riskScores, getWeatherByRiskFunc]);

  return { riskScores, bizModules, weather };
}; 