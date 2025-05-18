export const getGenericLineSeries = (row, name, color, years) => {
  return {
    name,
    type: 'line',
    data: years.map(y => (row && row[y] != null ? Number(row[y]) : null)),
    smooth: true,
    symbol: 'circle',
    showSymbol: false,
    lineStyle: { width: 4, color },
    itemStyle: { color },
  };
};

// findRowBS: 资产负债表查找函数，findRowIS: 利润表查找函数
export const calculateRatios = (trendData, financeISData, trendPeriods, findRowBS, findRowIS) => {
  if (!trendData || !trendPeriods) return {};

  // First check if trendData is the financial_ratios object from the backend
  if (typeof trendData === 'object' && !Array.isArray(trendData) && Object.keys(trendData).length > 0) {
    // New structure: trendData is object with period keys and ratio objects as values
    // Reorganize to the expected format for compatibility
    const result = {
      debt_ratio: [],
      current_ratio: [],
      quick_ratio: [],
      roe: [],
      interest_debt_ratio: [],
      capital_accumulation_ratio: [],
      main_net_profit_ratio: [],
      asset_turnover: [],
      receivable_turnover: [],
      inventory_turnover: []
    };

    // Map backend keys to frontend keys
    const keyMapping = {
      '资产负债率': 'debt_ratio',
      '流动比率': 'current_ratio',
      '速动比率': 'quick_ratio',
      '净资产收益率': 'roe',
      '有息负债占总资产比': 'interest_debt_ratio',
      '资本回报率': 'capital_accumulation_ratio',
      '主营业务利润率': 'main_net_profit_ratio',
      '总资产周转率': 'asset_turnover',
      '应收账款周转率': 'receivable_turnover',
      '存货周转率': 'inventory_turnover'
    };

    // Populate result arrays
    trendPeriods.forEach(period => {
      if (trendData[period]) {
        Object.entries(keyMapping).forEach(([backendKey, frontendKey]) => {
          result[frontendKey].push(trendData[period][backendKey]);
        });
      } else {
        // If period data missing, push null for all ratios
        Object.values(result).forEach(arr => arr.push(null));
      }
    });

    return result;
  }

  // If not using the new structure, fall back to old calculation method
  if (!financeISData) return {};

  const totalAsset = findRowBS('资产总计');
  const totalDebt = findRowBS('负债合计');
  const currentAsset = findRowBS('流动资产合计');
  const currentDebt = findRowBS('流动负债合计');
  const equity = findRowBS('所有者权益合计');
  const inventory = findRowBS('存货');
  const netProfit = findRowIS('净利润');
  const mainIncome = findRowIS('主营业务收入');
  const mainCost = findRowIS('主营业务成本');
  const shortLoan = findRowBS('短期借款');
  const longLoan = findRowBS('长期借款');
  const bond = findRowBS('应付债券');
  const receivable = findRowBS('应收账款');

  const safeNum = (val) => (val != null ? Number(val) : null);
  const safeDiv = (num, den, scale = 1, toFixed = 2) => {
    const n = safeNum(num);
    const d = safeNum(den);
    if (n == null || d == null || d === 0) return null;
    return (n / d * scale).toFixed(toFixed);
  };
  const safeSubDiv = (num1, num2, den, scale = 1, toFixed = 2) => {
    const n1 = safeNum(num1);
    const n2 = safeNum(num2);
    const d = safeNum(den);
    if (n1 == null || d == null || d === 0) return null;
    return ((n1 - (n2 || 0)) / d * scale).toFixed(toFixed);
  };

  return {
    debt_ratio: trendPeriods.map(y => safeDiv(totalDebt?.[y], totalAsset?.[y], 100)),
    current_ratio: trendPeriods.map(y => safeDiv(currentAsset?.[y], currentDebt?.[y], 1)),
    quick_ratio: trendPeriods.map(y => safeSubDiv(currentAsset?.[y], inventory?.[y], currentDebt?.[y], 1)),
    roe: trendPeriods.map(y => safeDiv(netProfit?.[y], equity?.[y], 100)),
    interest_debt_ratio: trendPeriods.map(y => {
      const interestDebt = (safeNum(shortLoan?.[y]) || 0) + (safeNum(longLoan?.[y]) || 0) + (safeNum(bond?.[y]) || 0);
      return safeDiv(interestDebt, totalAsset?.[y], 100);
    }),
    capital_accumulation_ratio: trendPeriods.map((y, i) => {
      if (i === 0) return null;
      const prevY = trendPeriods[i-1];
      return safeSubDiv(equity?.[y], equity?.[prevY], equity?.[prevY], 100);
    }),
    main_net_profit_ratio: trendPeriods.map(y => safeDiv(netProfit?.[y], mainIncome?.[y], 100)),
    asset_turnover: trendPeriods.map(y => safeDiv(mainIncome?.[y], totalAsset?.[y], 1)),
    receivable_turnover: trendPeriods.map(y => safeDiv(mainIncome?.[y], receivable?.[y], 1)),
    inventory_turnover: trendPeriods.map(y => safeDiv(mainCost?.[y], inventory?.[y], 1)),
  };
}; 