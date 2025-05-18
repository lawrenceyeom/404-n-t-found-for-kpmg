// src/constants.js
export const API_BASE = 'https://four04-n-t-found-for-kpmg-2.onrender.com/';
export const API_URL = API_BASE;

export const COMPANIES = [
  { id: 'aura', name: 'AURA稳健', desc: 'AURA稳健公司描述' },
  { id: 'beta', name: 'BETA成长', desc: 'BETA成长公司描述' },
  { id: 'crisis', name: 'CRISIS压力', desc: 'CRISIS压力公司描述' },
];

export const RISK_DIMENSIONS = [
  { key: 'finance', name: '财务风险' },
  { key: 'opinion', name: '舆情风险' },
  { key: 'operation', name: '运营风险' },
  { key: 'compliance', name: '合规风险' },
  { key: 'market', name: '市场风险' },
  { key: 'management', name: '管理风险' },
];

export const ASSET_ITEMS = [
  '货币资金', '应收账款', '存货', '固定资产', '在建工程',
  '无形资产', '长期股权投资', '其他应收款', '其他流动资产',
  '投资性房地产', '长期应收款', '交易性金融资产', '预付款项',
  '其他非流动资产'
];

// Main items that can be selected for trend analysis
export const MAIN_FINANCIAL_ITEMS = [
  { key: 'cash', label: '货币资金', type: 'asset' },
  { key: 'receivable', label: '应收账款', type: 'asset' },
  { key: 'inventory', label: '存货', type: 'asset' },
  { key: 'fixed_assets', label: '固定资产', type: 'asset' },
  { key: 'construction', label: '在建工程', type: 'asset' },
  { key: 'intangible', label: '无形资产', type: 'asset' },
  { key: 'investment_property', label: '投资性房地产', type: 'asset' },
  { key: 'long_term_equity', label: '长期股权投资', type: 'asset' },
  { key: 'other_receivables', label: '其他应收款', type: 'asset' },
  { key: 'total_current_assets', label: '流动资产合计', type: 'asset' },
  { key: 'total_assets', label: '资产总计', type: 'asset' },
  
  { key: 'short_borrowings', label: '短期借款', type: 'liability' },
  { key: 'accounts_payable', label: '应付账款', type: 'liability' },
  { key: 'contract_liabilities', label: '合同负债', type: 'liability' },
  { key: 'long_borrowings', label: '长期借款', type: 'liability' },
  { key: 'bonds_payable', label: '应付债券', type: 'liability' },
  { key: 'debt', label: '流动负债合计', type: 'liability' },
  { key: 'non_current_liabilities', label: '非流动负债合计', type: 'liability' },
  { key: 'total_liabilities', label: '负债合计', type: 'liability' },
  
  { key: 'share_capital', label: '实收资本（或股本）', type: 'equity' },
  { key: 'capital_reserve', label: '资本公积', type: 'equity' },
  { key: 'surplus_reserve', label: '盈余公积', type: 'equity' },
  { key: 'undistributed_profit', label: '未分配利润', type: 'equity' },
  { key: 'total_equity', label: '所有者权益合计', type: 'equity' },
  
  { key: 'revenue', label: '营业收入', type: 'income' },
  { key: 'operating_costs', label: '营业成本', type: 'income' },
  { key: 'operating_profit', label: '营业利润', type: 'income' },
  { key: 'total_profit', label: '利润总额', type: 'income' },
  { key: 'net_profit', label: '净利润', type: 'income' }
];

// Main items initially selected
export const INITIAL_MAIN_ITEMS = ['cash', 'receivable', 'fixed_assets', 'accounts_payable', 'net_profit'];

export const BIZ_MODULES_MAP = {
  aura: ['商品销售', '供应链金融', '物流服务', '海外贸易', '其他业务'],
  beta: ['房地产开发', '物业管理', '商业运营', '投资并购', '其他业务'],
  crisis: ['基建工程', '政府项目', '环保工程', '设备租赁', '其他业务'],
};

export const DEFAULT_TREND_PERIODS = ["2020", "2021", "2022", "2023", "2024", "2025_Q1"];

export const ALL_RATIOS_CONFIG = [
  { key: 'debt_ratio', label: '资产负债率' },
  { key: 'current_ratio', label: '流动比率' },
  { key: 'quick_ratio', label: '速动比率' },
  { key: 'interest_debt_ratio', label: '有息负债占比' },
  { key: 'roe', label: '净资产收益率' },
  { key: 'capital_accumulation_ratio', label: '资本积累率' },
  { key: 'main_net_profit_ratio', label: '主营业务净利率' },
  { key: 'asset_turnover', label: '总资产周转率' },
  { key: 'receivable_turnover', label: '应收账款周转率' },
  { key: 'inventory_turnover', label: '存货周转率' },
];

export const INITIAL_SELECTED_RATIOS = ['debt_ratio', 'current_ratio', 'roe', 'interest_debt_ratio'];
export const INITIAL_TREND_METRIC_KEYS_MAIN = INITIAL_MAIN_ITEMS;

export const RISK_DIM_EXPLAIN = {
  finance: { reason: '财务指标异常波动，存在偿债、盈利等风险。', advice: '建议重点关注资产负债表和利润表的异常变动，复核大额科目。' },
  opinion: { reason: '近期舆情负面信息增多，外部关注度高。', advice: '建议关注媒体与社交平台动态，及时应对负面舆情。' },
  operation: { reason: '运营数据波动较大，存在管理或流程风险。', advice: '建议复核关键业务流程，关注运营效率和合规性。' },
  compliance: { reason: '合规风险高，存在违规隐患。', advice: '建议重点复核合规事项，完善内控流程。' },
  market: { reason: '市场环境波动，外部风险加剧。', advice: '建议关注行业动态，做好市场风险预警。' },
  management: { reason: '管理层变动或决策失误风险。', advice: '建议关注管理层稳定性和决策流程。' },
};

export const RISK_DIM_KEYS = ['finance', 'opinion', 'operation', 'compliance', 'market', 'management'];

export const INITIAL_RISK_SCORES = [30, 20, 25, 15, 18, 12];
export const INITIAL_WEATHER = { type: 'sunny', label: '晴天', color: '#4be1a0', explain: '', advice: '' };

export const CARD_STYLE_BASE = {
  background: 'linear-gradient(135deg, #223366 80%, #1e90ff22 100%)',
  borderRadius: 16,
  padding: '20px',
  boxShadow: '0 2px 10px #22336622',
  border: '1.5px solid #223366',
  height: '170px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  gap: 8,
};

export const CONTENT_BOX_STYLE = {
  flex: 1,
  minWidth: 0,
  wordBreak: 'break-all',
  overflowY: 'auto',
  fontSize: '1.02rem',
  lineHeight: 1.4,
  width: '100%',
}; 