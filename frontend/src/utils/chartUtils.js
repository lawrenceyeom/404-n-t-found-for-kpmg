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
  if (!trendData || !financeISData || !trendPeriods) return {};

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