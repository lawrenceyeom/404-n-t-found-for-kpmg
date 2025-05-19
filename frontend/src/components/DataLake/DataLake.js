import React, { useState, useEffect, useCallback } from 'react';
import './DataLake.css';
import EChartsLine from './charts/EChartsLine';
import EChartsBar from './charts/EChartsBar';
import EChartsFeatureBar from './charts/EChartsFeatureBar';
import EChartsPie from './charts/EChartsPie';
import EChartsRadar from './charts/EChartsRadar';
import EChartsHeatmap from './charts/EChartsHeatmap';
import { API_BASE as GLOBAL_API_BASE } from '../../constants';
import AuditAnalysisView from './AnalysisViews/AuditAnalysisView';
import { useLocation } from 'react-router-dom';

const HEADER_MAPPINGS = {
  // Finance Raw (renderTable) & Financial Ratios
  date: "日期",
  revenue: "收入 (百万元)",
  profit: "利润 (百万元)",
  cost: "成本 (百万元)",
  assets: "资产 (百万元)",
  liabilities: "负债 (百万元)",
  equity: "权益 (百万元)",
  cashflow: "现金流 (百万元)",
  eps: "每股收益 (元)",
  roe: "净资产收益率 (%)",
  gross_margin: "毛利率 (%)",
  operating_margin: "营业利润率 (%)",
  net_profit_margin: "净利润率 (%)", 
  net_margin: "净利率 (%)",
  current_ratio: "流动比率",
  quick_ratio: "速动比率",
  debt_to_equity_ratio: "产权比率 (负债/权益)",
  debt_ratio: "资产负债率 (%)",
  asset_turnover: "总资产周转率",
  inventory_turnover: "存货周转率",
  accounts_receivable_turnover: "应收账款周转率",
  receivable_turnover: "应收账款周转率",
  accounts_payable_turnover: "应付账款周转率",

  // Operation Raw (renderTimeSeries) & KPIs
  sales: "销售额",
  production: "产量",
  inventory: "库存水平",
  inventory_levels: "库存水平",
  capacity_utilization: "产能利用率 (%)",
  employee_count: "员工人数",
  customer_satisfaction_rate: "客户满意度 (%)",
  customer_satisfaction: "客户满意度 (%)", // Alternate key for same concept
  website_traffic: "网站流量",
  social_media_engagement: "社交媒体互动量",
  order_fulfillment_rate: "订单履行率 (%)",
  on_time_delivery_rate: "准时交货率 (%)",
  defect_rate: "产品缺陷率 (%)",
  machine_uptime: "设备正常运行时间 (%)",
  employee_turnover_rate: "员工离职率 (%)",
  average_handle_time: "平均处理时长 (秒)",
  first_call_resolution: "首次呼叫解决率 (%)",
  net_promoter_score: "净推荐值 (NPS)",
  property_occupy: "物业占用率 (%)",
  project_completion_rate: "项目完成率 (%)",
  operational_costs: "运营成本 (百万元)",
  employee_productivity: "员工生产效率",
  maintenance_costs: "维护成本 (百万元)",
  project_delay_days: "项目延期天数",
  logistics_efficiency: "物流效率 (%)",
  supply_chain_delay_hours: "供应链延迟 (小时)",
  property_occupancy_rate: "物业入驻率 (%)",
  equipment_utilization_rate: "设备利用率 (%)",

  // Macro Raw (renderMacro)
  year: "年份",
  quarter: "季度",
  GDP: "国内生产总值 (亿元)",
  CPI: "居民消费价格指数 (%)",
  PPI: "工业生产者出厂价格指数 (%)",
  PMI: "采购经理指数",
  M2: "广义货币供应量 (万亿元)",
  unemployment: "城镇调查失业率 (%)",
  fixed_asset_investment: "固定资产投资增速 (%)",
  retail_sales: "社会消费品零售总额增速 (%)",
  foreign_exchange_reserves: "外汇储备 (万亿美元)",

  // External Raw (Benchmarks - AURA)
  benchmark_company_name: "对标公司名称",
  annual_revenue_billion_cny: "年收入 (十亿人民币)",
  net_profit_margin_pct: "净利润率 (%)",
  global_logistics_network_score: "全球物流网络评分",
  supply_chain_finance_volume_billion_cny: "供应链金融规模 (十亿人民币)",
  commodity_trading_segments: "大宗交易品类",
  digital_transformation_index: "数字化转型指数",

  // External Raw (Benchmarks - BETA)
  total_assets_billion_cny: "总资产 (十亿人民币)",
  sales_revenue_billion_cny: "销售收入 (十亿人民币)",
  property_portfolio_sqm_million: "物业组合面积 (百万㎡)",
  commercial_rental_income_billion_cny: "商业租金收入 (十亿人民币)",
  investment_focus_areas: "投资重点领域",
  sustainability_rating: "可持续发展评级",

  // External Raw (Benchmarks - CRISIS)
  order_backlog_billion_cny: "未完成订单 (十亿人民币)",
  equipment_leasing_revenue_billion_cny: "设备租赁收入 (十亿人民币)",
  environmental_projects_segment_pct: "环保项目占比 (%)",
  gov_project_experience_score: "政府项目经验评分",
  
  // Generic keys that might appear in `data.results` or other tables
  id: "ID/编号",
  name: "名称",
  value: "数值",
  category: "类别",
  score: "得分",
  type: "类型",
  status: "状态",
  description: "描述",
  count: "数量",
  amount: "金额",
  percentage: "百分比 (%)",
  average: "平均值",
  total: "总计",
  rank: "排名",
  index: "指数",
  source: "来源", // Example for policy source if needed
  importance: "重要性",
  influence_period: "影响周期",
  authority: "发布机构", // Example for regulation authority
  impact_level: "影响级别",
  compliance_status: "合规状态",
  company: "公司", // Generic company key if used in tables
  region: "地区", // Generic region key
  market_share: "市场份额 (%)",
  growth_rate: "增长率 (%)",
  pe_ratio: "市盈率",
  ps_ratio: "市销率",

  // Feature Importance (renderFeatureChart)
  feature: "特征名称",
  importance_score: "重要性评分", // Assuming this is a key if data.features is an array of objects
};

const getTranslatedHeader = (key) => HEADER_MAPPINGS[key] || key;

const COMPANIES = [
  { id: 'aura', name: 'AURA稳健' },
  { id: 'beta', name: 'BETA成长' },
  { id: 'crisis', name: 'CRISIS压力' }
];
const DATA_TYPES = [
  { id: 'finance', name: '财务数据' },
  { id: 'operation', name: '运营数据' },
  { id: 'opinion', name: '舆情数据' },
  { id: 'macro', name: '宏观数据' },
  { id: 'external', name: '外部数据' }
];
const DATA_LAYERS = [
  { id: 'raw', name: '原始数据' },
  { id: 'feature', name: '特征工程后数据' },
  { id: 'analysis', name: '模型分析后数据' }
];

const API_BASE = `${GLOBAL_API_BASE}/api/datalake`;

function DataLake({ lakeType }) {
  const location = useLocation();
  const initialDataType = location.state?.initialDataType || 'finance';
  const initialLayer = location.state?.initialLayer || 'raw';
  
  const [company, setCompany] = useState('aura');
  const [dataType, setDataType] = useState(initialDataType);
  const [layer, setLayer] = useState(initialLayer);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 当Header中的lakeType变化时，更新DataLake内部的company状态
  useEffect(() => {
    if (lakeType === 'AURA稳健') setCompany('aura');
    else if (lakeType === 'BETA成长') setCompany('beta');
    else if (lakeType === 'CRISIS压力') setCompany('crisis');
  }, [lakeType]);
  
  // 使用useCallback记忆化这些函数，避免不必要的重新渲染
  const handleCompanyChange = useCallback((newCompany) => {
    setData(null); // 立即清除数据，防止旧数据导致渲染错误
    setError(null);
    setCompany(newCompany);
  }, []);
  
  const handleDataTypeChange = useCallback((newDataType) => {
    setData(null); // 立即清除数据，防止旧数据导致渲染错误
    setError(null);
    setDataType(newDataType);
  }, []);
  
  const handleLayerChange = useCallback((newLayer) => {
    setData(null); // 立即清除数据，防止旧数据导致渲染错误
    setError(null);
    setLayer(newLayer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // 添加50毫秒延迟，确保旧数据已被清除
    const timer = setTimeout(() => {
      // Use dedicated endpoint for opinion data
      const fetchUrl = dataType === 'opinion' && layer === 'raw'
        ? `${API_BASE}/opinion/?company=${company}`
        : `${API_BASE}/?company=${company}&data_type=${dataType}&layer=${layer}`;

      fetch(fetchUrl)
        .then(res => {
          if (!res.ok) throw new Error('数据获取失败');
          return res.json();
        })
        .then(json => {
          if (isMounted) setData(json);
        })
        .catch(e => {
          if (isMounted) setError(e.message);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 50);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [company, dataType, layer]);

  // 渲染表格型数据
  const renderTable = (table) => (
    <div className="datalake-table-container">
      <table className="datalake-table">
        <thead>
          <tr>
            {table.length > 0 && Object.keys(table[0]).map(key => (
              <th key={key}>{getTranslatedHeader(key)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 渲染文本型数据（新闻+评论）
  const renderText = (news, comments) => (
    <div className="datalake-text-blocks">
      <div className="datalake-news-block">
        <div className="datalake-block-title">新闻资讯</div>
        {news && news.map((n, i) => (
          <div className="datalake-news-item" key={i}>
            <div className="datalake-news-title">{n.title}</div>
            <div className="datalake-news-content">{n.content}</div>
            <div className="datalake-news-meta">{n.date} | 情感分数: {n.sentiment}</div>
          </div>
        ))}
      </div>
      <div className="datalake-comments-block">
        <div className="datalake-block-title">社交评论</div>
        {comments && comments.map((c, i) => (
          <div className="datalake-comment-item" key={i}>
            <span className="datalake-comment-user">{c.user}：</span>
            <span className="datalake-comment-content">{c.comment}</span>
            <span className="datalake-comment-meta">{c.date} | 情感分数: {c.sentiment}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染时间序列和事件流
  const renderTimeSeries = (timeseries, operationalEvents) => (
    <div className="datalake-timeseries-block">
      <div className="datalake-block-title">时间序列</div>
      {timeseries && timeseries.dates && (
        <div className="datalake-table-container">
          <table className="datalake-table">
            <thead>
              <tr>
                <th>{getTranslatedHeader('date')}</th>
                {Object.keys(timeseries).filter(k => k !== 'dates').map(k => <th key={k}>{getTranslatedHeader(k)}</th>)}
              </tr>
            </thead>
            <tbody>
              {timeseries.dates.map((date, idx) => (
                <tr key={date}>
                  <td>{date}</td>
                  {Object.keys(timeseries).filter(k => k !== 'dates').map(k => <td key={k}>{timeseries[k][idx]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="datalake-block-title" style={{marginTop: 24}}>事件流</div>
      {operationalEvents && operationalEvents.map((e, i) => (
        <div className="datalake-event-item" key={i}>
          <span className="datalake-event-time">{e.date}</span>
          <div className="datalake-event-details">
            <span className="datalake-event-title">{e.event}</span>
            {e.description && <div className="datalake-event-description">{e.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );

  // 结构化数据适配为ECharts参数
  const renderOperationChart = (data) => {
    if (!data.timeseries || !data.timeseries.dates) return <div>暂无趋势数据</div>;
    const xData = data.timeseries.dates;
    const series = [];
    if (data.timeseries.sales) series.push({ name: '销售', data: data.timeseries.sales });
    if (data.timeseries.production) series.push({ name: '生产', data: data.timeseries.production });
    return <EChartsLine title="运营趋势" xData={xData} series={series} legend={series.map(s=>s.name)} />;
  };

  const renderMacroChart = (data) => {
    if (!data.indicators || !data.indicators.length) return <div>暂无宏观数据</div>;
    const xData = data.indicators.map(i => i.year);
    const series = [
      { name: 'GDP', data: data.indicators.map(i => i.GDP) },
      { name: 'CPI', data: data.indicators.map(i => i.CPI) },
      { name: 'PMI', data: data.indicators.map(i => i.PMI) }
    ];
    return <EChartsLine title="宏观经济趋势" xData={xData} series={series} legend={['GDP','CPI','PMI']} />;
  };

  const renderFinanceChart = (data) => {
    if (!data.table || !data.table.length) return <div>暂无财务数据</div>;
    // 创建数据副本并按日期从早到晚排序
    const sortedData = [...data.table].sort((a, b) => new Date(a.date) - new Date(b.date));
    const xData = sortedData.map(i => i.date);
    const series = [
      { name: '收入', data: sortedData.map(i => i.revenue) },
      { name: '利润', data: sortedData.map(i => i.profit) },
      { name: '现金流', data: sortedData.map(i => i.cashflow) }
    ];
    return <EChartsBar title="财务对比" xData={xData} series={series} legend={['收入','利润','现金流']} />;
  };

  const renderFeatureChart = (data) => {
    if (!data.features || !data.features.length) return <div>暂无特征数据</div>;
    return <EChartsFeatureBar features={data.features} title="特征重要性" />;
  };

  // 渲染外部数据（政策、对标公司、法规等）
  const renderExternal = (data) => (
    <div className="datalake-external-sections-container">
      {/* Policies Section */}
      {data.policies && data.policies.length > 0 && (
        <div className="datalake-external-section">
          <div className="datalake-block-title">行业政策</div>
          <div className="datalake-scrollable-list">
            {data.policies.map((p, i) => (
              <div className="datalake-policy-item" key={i} onClick={() => alert(p.content)} style={{cursor:'pointer'}}>
                <span className="datalake-policy-title">{p.title}</span>
                <span className="datalake-policy-date">{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark Companies Section */}
      {data.benchmarks && data.benchmarks.length > 0 && (
        <div className="datalake-external-section">
          <div className="datalake-block-title">行业对标公司</div>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  {Object.keys(data.benchmarks[0]).map(key => <th key={key}>{getTranslatedHeader(key)}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.benchmarks.map((row, i) => (
                  <tr key={i} onClick={() => alert(JSON.stringify(row, null, 2))} style={{cursor:'pointer'}}>
                    {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regulations Section */}
      {data.regulations && data.regulations.length > 0 && (
        <div className="datalake-external-section">
          <div className="datalake-block-title">法规</div>
          <div className="datalake-scrollable-list">
            {data.regulations.map((r, i) => (
              <div className="datalake-regulation-item" key={i} onClick={() => alert(r.content)} style={{cursor:'pointer'}}>
                <span className="datalake-regulation-title">{r.title}</span>
                <span className="datalake-regulation-date">{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染宏观数据（表格+政策+解读等）
  const renderMacro = (data) => (
    <div className="datalake-macro-content-area"> 
      {/* "宏观经济指标" Section - Full Width */}
      {data.indicators && (
        <div className="datalake-macro-section">
          <div className="datalake-block-title">宏观经济指标</div>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  {Object.keys(data.indicators[0]).slice(0, 7).map(key => (
                    <th key={key}>{getTranslatedHeader(key)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.indicators.map((row, i) => (
                  <tr key={i} onClick={() => alert(JSON.stringify(row, null, 2))} style={{cursor:'pointer'}}>
                    {Object.entries(row).slice(0, 7).map(([key, value], j) => (
                      <td key={j}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* "相关政策" Section - Full Width List */}
      {data.policies && (
        <div className="datalake-macro-section">
          <div className="datalake-block-title">相关政策</div>
          <div className="datalake-policy-list-container">
            {data.policies.map((p, i) => (
              <div className="datalake-policy-item" key={i} onClick={() => alert(p.content)} style={{cursor:'pointer'}}>
                <span className="datalake-policy-title">{p.title}</span>
                <span className="datalake-policy-date">{p.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Detailed Analysis" Section - Three Columns */}
      {(data.industry_specific_interpretation || data.forecast_scenarios || data.risk_factors) && (
        <div className="datalake-macro-detailed-analysis-grid">
          {/* Column 1: Industry Interpretation */}
          {data.industry_specific_interpretation && (
            <div className="datalake-analysis-card">
              <div className="datalake-block-title">行业解读</div>
              <div className="datalake-card-content-scrollable">
                <p><strong>公司类型:</strong> {data.industry_specific_interpretation.company_type}</p>
                <p><strong>竞争格局:</strong> {data.industry_specific_interpretation.competitive_landscape_outlook}</p>
                <p><strong>监管趋势:</strong> {data.industry_specific_interpretation.regulatory_trend_forecast}</p>
              </div>
            </div>
          )}

          {/* Column 2: Economic Forecast Scenarios */}
          {data.forecast_scenarios && (
            <div className="datalake-analysis-card">
              <div className="datalake-block-title">经济预测情景</div>
              <div className="datalake-card-content-scrollable">
                {data.forecast_scenarios.map((s, i) => (
                  <div className="datalake-forecast-item" key={i}>
                    <p><strong>情景: {s.scenario} ({(s.probability * 100).toFixed(0)}%)</strong></p>
                    <p>GDP增速: {s.gdp_growth}%, 行业增速: {s.industry_growth}%</p>
                    <p>关键假设: {s.key_assumptions.join(', ')}</p>
                    <p>影响: {s.impact_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column 3: Key Risk Factors */}
          {data.risk_factors && (
            <div className="datalake-analysis-card">
              <div className="datalake-block-title">主要风险因素</div>
              <div className="datalake-card-content-scrollable">
                <strong>外部风险:</strong>
                <ul>
                  {data.risk_factors.external_risks && data.risk_factors.external_risks.slice(0,3).map((r, i) => (
                    <li key={`ext-${i}`}>{r.risk} (可能: {(r.probability * 100).toFixed(0)}%, 影响: {r.impact})</li>
                  ))}
                </ul>
                <strong>政策风险:</strong>
                <ul>
                  {data.risk_factors.policy_risks && data.risk_factors.policy_risks.slice(0,2).map((r, i) => (
                    <li key={`pol-${i}`}>{r.risk} (可能: {(r.probability * 100).toFixed(0)}%, 影响: {r.impact})</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 渲染运营KPI仪表板
  const renderOperationDashboard = (data) => {
    if (!data.kpi_summary) return null;
    
    const kpiData = data.kpi_summary;
    const pieData = [
      { name: '销售', value: kpiData.sales_actual || 0 },
      { name: '生产', value: kpiData.production_actual || 0 },
    ];
    
    const radarData = [
      {
        name: '目标达成率',
        value: [
          kpiData.sales_achievement || 0,
          kpiData.production_achievement || 0,
          kpiData.efficiency_achievement || 0,
          kpiData.defect_achievement || 0,
          1.0
        ]
      }
    ];
    
    const radarIndicator = [
      { name: '销售', max: 1.5 },
      { name: '生产', max: 1.5 },
      { name: '效率', max: 1.5 },
      { name: '质量', max: 1.5 },
      { name: '基准', max: 1.5 }
    ];

    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">运营KPI概览</h3>
          <div className="datalake-kpi-grid">
            <div className="datalake-kpi-card">
              <div className="datalake-kpi-title">销售</div>
              <div className="datalake-kpi-value">{kpiData.sales_actual.toLocaleString()}</div>
              <div className="datalake-kpi-achievement" style={{color: kpiData.sales_achievement >= 1 ? '#4be1a0' : '#ff5c5c'}}>
                目标达成率: {(kpiData.sales_achievement * 100).toFixed(1)}%
              </div>
            </div>
            <div className="datalake-kpi-card">
              <div className="datalake-kpi-title">生产</div>
              <div className="datalake-kpi-value">{kpiData.production_actual.toLocaleString()}</div>
              <div className="datalake-kpi-achievement" style={{color: kpiData.production_achievement >= 1 ? '#4be1a0' : '#ff5c5c'}}>
                目标达成率: {(kpiData.production_achievement * 100).toFixed(1)}%
              </div>
            </div>
            <div className="datalake-kpi-card">
              <div className="datalake-kpi-title">效率</div>
              <div className="datalake-kpi-value">{(kpiData.efficiency_actual * 100).toFixed(1)}%</div>
              <div className="datalake-kpi-achievement" style={{color: kpiData.efficiency_achievement >= 1 ? '#4be1a0' : '#ff5c5c'}}>
                目标达成率: {(kpiData.efficiency_achievement * 100).toFixed(1)}%
              </div>
            </div>
            <div className="datalake-kpi-card">
              <div className="datalake-kpi-title">产品缺陷率</div>
              <div className="datalake-kpi-value">{(kpiData.defect_actual * 100).toFixed(2)}%</div>
              <div className="datalake-kpi-achievement" style={{color: kpiData.defect_achievement >= 1 ? '#4be1a0' : '#ff5c5c'}}>
                目标达成率: {(kpiData.defect_achievement * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="datalake-charts-row">
            <div className="datalake-chart-half">
              <EChartsPie title="业务指标分布" data={pieData} />
            </div>
            <div className="datalake-chart-half">
              <EChartsRadar title="目标达成率" data={radarData} indicator={radarIndicator} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染部门绩效分析
  const renderDepartmentAnalysis = (data) => {
    if (!data.departments || !Array.isArray(data.departments)) return null;
    
    const departments = data.departments;
    const barData = departments.map(d => ({
      name: d.name,
      value: d.performance
    }));
    
    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">部门绩效分析</h3>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>部门</th>
                  <th>人数</th>
                  <th>绩效</th>
                  <th>成本</th>
                  <th>人均产值</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, i) => (
                  <tr key={i}>
                    <td>{dept.name}</td>
                    <td>{dept.headcount}人</td>
                    <td style={{color: dept.performance >= 0.95 ? '#4be1a0' : dept.performance >= 0.9 ? '#ffd666' : '#ff5c5c'}}>
                      {(dept.performance * 100).toFixed(1)}%
                    </td>
                    <td>{dept.cost.toLocaleString()}</td>
                    <td>{(dept.cost / dept.headcount).toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <EChartsFeatureBar title="部门绩效对比" features={barData} />
        </div>
      </div>
    );
  };

  // 渲染舆情分析仪表板
  const renderOpinionDashboard = (data) => {
    if (!data.sentiment_summary || !data.media_exposure) return null;
    
    const sentiment = data.sentiment_summary;
    const media = data.media_exposure;
    
    const sentimentPieData = [
      { name: '正面', value: sentiment.positive_rate || 0 },
      { name: '中性', value: sentiment.neutral_rate || 0 },
      { name: '负面', value: sentiment.negative_rate || 0 }
    ];
    
    const platformPieData = media.platform_distribution ? media.platform_distribution.map(p => ({
      name: p.platform,
      value: p.percentage
    })) : [];

    const heatmapData = [];
    const xData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const yData = ['早间', '午间', '晚间', '深夜'];
    
    // 模拟舆情热度热力图数据
    for (let i = 0; i < yData.length; i++) {
      for (let j = 0; j < xData.length; j++) {
        // 使用media.daily_mentions生成模拟数据
        const baseValue = media.daily_mentions ? media.daily_mentions[j % media.daily_mentions.length] : 30;
        const value = baseValue * (Math.random() * 0.5 + 0.75) / (i === 3 ? 2 : 1);
        heatmapData.push([j, i, Math.round(value)]);
      }
    }

    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">舆情分析概览</h3>
          
          <div className="datalake-info-card">
            <div className="datalake-info-title">舆情综合评分: {sentiment.overall_score.toFixed(2)}</div>
            <div className="datalake-info-content">
              整体舆情状况: <span style={{
                color: sentiment.trending === 'stable_positive' ? '#4be1a0' : 
                       sentiment.trending === 'improving' ? '#36e2ec' :
                       sentiment.trending === 'stable_neutral' ? '#ffd666' : '#ff5c5c'
              }}>
                {sentiment.trending === 'stable_positive' ? '稳定积极' : 
                 sentiment.trending === 'improving' ? '持续改善' :
                 sentiment.trending === 'stable_neutral' ? '稳定中性' : '需要关注'}
              </span>
              <br />
              关键积极话题: {sentiment.key_positive_topics.join('、')}
            </div>
          </div>
          
          <div className="datalake-charts-row">
            <div className="datalake-chart-half">
              <EChartsPie title="舆情情感分布" data={sentimentPieData} />
            </div>
            <div className="datalake-chart-half">
              <EChartsPie title="媒体平台分布" data={platformPieData} />
            </div>
          </div>
          
          <div className="datalake-chart-full">
            <EChartsHeatmap 
              title="舆情热度分布" 
              xData={xData} 
              yData={yData} 
              data={heatmapData} 
              min={10} 
              max={60} 
            />
          </div>
        </div>
      </div>
    );
  };

  // 渲染财务数据仪表板
  const renderFinanceDashboard = (data) => {
    if (!data.balance_sheet || !data.income_statement || !data.cash_flow) return null;
    
    const balanceSheet = data.balance_sheet;
    const incomeStatement = data.income_statement;
    const cashFlow = data.cash_flow;
    const ratios = data.financial_ratios;
    
    const balancePieData = [
      { name: '流动资产', value: balanceSheet.assets.current_assets.total_current_assets },
      { name: '非流动资产', value: balanceSheet.assets.non_current_assets.total_non_current_assets }
    ];
    
    const liabilityPieData = [
      { name: '流动负债', value: balanceSheet.liabilities.current_liabilities.total_current_liabilities },
      { name: '非流动负债', value: balanceSheet.liabilities.non_current_liabilities.total_non_current_liabilities },
      { name: '所有者权益', value: balanceSheet.equity.total_equity }
    ];

    const profitPieData = [
      { name: '销售成本', value: incomeStatement.cost_of_goods_sold },
      { name: '运营费用', value: incomeStatement.operating_expenses.total_operating_expenses },
      { name: '税费', value: incomeStatement.income_tax_expense },
      { name: '净利润', value: incomeStatement.net_income }
    ];

    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">财务状况分析</h3>
          
          <div className="datalake-info-card">
            <div className="datalake-info-title">财务健康评分</div>
            <div className="datalake-info-content">
              <div className="datalake-financial-metrics">
                <div className="datalake-metric">
                  <div className="datalake-metric-name">盈利能力</div>
                  <div className="datalake-metric-value" style={{color: '#4be1a0'}}>优</div>
                  <div className="datalake-metric-detail">ROE: {(ratios.profitability.return_on_equity * 100).toFixed(1)}%</div>
                </div>
                <div className="datalake-metric">
                  <div className="datalake-metric-name">偿债能力</div>
                  <div className="datalake-metric-value" style={{color: '#36e2ec'}}>良</div>
                  <div className="datalake-metric-detail">流动比率: {ratios.liquidity.current_ratio.toFixed(2)}</div>
                </div>
                <div className="datalake-metric">
                  <div className="datalake-metric-name">运营效率</div>
                  <div className="datalake-metric-value" style={{color: '#4be1a0'}}>优</div>
                  <div className="datalake-metric-detail">资产周转率: {ratios.efficiency.asset_turnover.toFixed(2)}</div>
                </div>
                <div className="datalake-metric">
                  <div className="datalake-metric-name">发展能力</div>
                  <div className="datalake-metric-value" style={{color: '#ffd666'}}>中</div>
                  <div className="datalake-metric-detail">收入增长率: 8.2%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="datalake-charts-row">
            <div className="datalake-chart-third">
              <EChartsPie title="资产构成" data={balancePieData} />
            </div>
            <div className="datalake-chart-third">
              <EChartsPie title="负债与权益" data={liabilityPieData} />
            </div>
            <div className="datalake-chart-third">
              <EChartsPie title="盈利构成" data={profitPieData} />
            </div>
          </div>
          
          <h3 className="datalake-block-title">主要财务指标</h3>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>类别</th>
                  <th>指标</th>
                  <th>数值</th>
                  <th>行业平均</th>
                  <th>评估</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="3">盈利能力</td>
                  <td>毛利率</td>
                  <td>{(ratios.profitability.gross_margin * 100).toFixed(1)}%</td>
                  <td>26.5%</td>
                  <td style={{color: '#4be1a0'}}>优</td>
                </tr>
                <tr>
                  <td>净利率</td>
                  <td>{(ratios.profitability.net_profit_margin * 100).toFixed(1)}%</td>
                  <td>12.8%</td>
                  <td style={{color: '#4be1a0'}}>优</td>
                </tr>
                <tr>
                  <td>ROE</td>
                  <td>{(ratios.profitability.return_on_equity * 100).toFixed(1)}%</td>
                  <td>12.5%</td>
                  <td style={{color: '#4be1a0'}}>优</td>
                </tr>
                <tr>
                  <td rowSpan="3">偿债能力</td>
                  <td>流动比率</td>
                  <td>{ratios.liquidity.current_ratio.toFixed(2)}</td>
                  <td>2.10</td>
                  <td style={{color: '#36e2ec'}}>良</td>
                </tr>
                <tr>
                  <td>速动比率</td>
                  <td>{ratios.liquidity.quick_ratio.toFixed(2)}</td>
                  <td>1.65</td>
                  <td style={{color: '#36e2ec'}}>良</td>
                </tr>
                <tr>
                  <td>资产负债率</td>
                  <td>{(ratios.solvency.debt_ratio * 100).toFixed(1)}%</td>
                  <td>45.2%</td>
                  <td style={{color: '#36e2ec'}}>良</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // 渲染宏观经济分析
  const renderMacroAnalysis = (data) => {
    if (!data.industry_indicators || !data.regional_comparison || !data.forecast_scenarios) return null;
    
    const industry = data.industry_indicators;
    const regions = data.regional_comparison;
    const forecasts = data.forecast_scenarios;
    
    const forecastData = forecasts.map(f => ({
      name: f.scenario,
      value: f.probability * 100
    }));
    
    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">行业和区域分析</h3>
          
          <div className="datalake-info-card">
            <div className="datalake-info-title">行业概览</div>
            <div className="datalake-info-content">
              <div className="datalake-metrics-grid">
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">市场规模:</span>
                  <span className="datalake-metric-value">{industry.market_size.toLocaleString()}</span>
                </div>
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">市场增长率:</span>
                  <span className="datalake-metric-value">{(industry.market_growth * 100).toFixed(1)}%</span>
                </div>
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">竞争强度:</span>
                  <span className="datalake-metric-value">{(industry.competitive_intensity * 10).toFixed(1)}/10</span>
                </div>
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">进入壁垒:</span>
                  <span className="datalake-metric-value">{(industry.entry_barriers * 10).toFixed(1)}/10</span>
                </div>
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">技术成熟度:</span>
                  <span className="datalake-metric-value">{(industry.technology_adoption * 10).toFixed(1)}/10</span>
                </div>
                <div className="datalake-metric-item">
                  <span className="datalake-metric-label">行业生命周期:</span>
                  <span className="datalake-metric-value">{industry.industry_lifecycle}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="datalake-charts-row">
            <div className="datalake-chart-half">
              <h4 className="datalake-subtitle">区域发展情况</h4>
              <div className="datalake-table-container">
                <table className="datalake-table">
                  <thead>
                    <tr>
                      <th>区域</th>
                      <th>GDP增长</th>
                      <th>行业集中度</th>
                      <th>市场潜力</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regions.map((r, i) => (
                      <tr key={i}>
                        <td>{r.region}</td>
                        <td>{(r.gdp_growth * 100).toFixed(1)}%</td>
                        <td>{(r.industry_concentration * 100).toFixed(1)}%</td>
                        <td style={{
                          color: r.market_potential >= 9 ? '#4be1a0' : 
                                r.market_potential >= 8 ? '#36e2ec' :
                                r.market_potential >= 7 ? '#ffd666' : '#ff5c5c'
                        }}>
                          {r.market_potential.toFixed(1)}/10
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="datalake-chart-half">
              <EChartsPie title="宏观经济情景概率" data={forecastData} />
            </div>
          </div>
          
          <h3 className="datalake-block-title">经济与政策风险分析</h3>
          <div className="datalake-risk-grid">
            {data.risk_factors && data.risk_factors.external_risks && 
             data.risk_factors.external_risks.map((risk, i) => (
              <div key={i} className="datalake-risk-card" style={{
                borderColor: risk.impact > 0.8 ? '#ff5c5c' : 
                            risk.impact > 0.6 ? '#ffd666' : '#36e2ec'
              }}>
                <div className="datalake-risk-title">{risk.risk}</div>
                <div className="datalake-risk-metrics">
                  <div>
                    <span className="datalake-risk-label">可能性:</span>
                    <span className="datalake-risk-value">{(risk.probability * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="datalake-risk-label">影响度:</span>
                    <span className="datalake-risk-value">{(risk.impact * 10).toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="datalake-risk-label">缓解度:</span>
                    <span className="datalake-risk-value">{(risk.mitigation_level * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染外部环境分析
  const renderExternalAnalysis = (data) => {
    if (!data.market_environment || !data.risk_factors) return null;
    
    const marketEnv = data.market_environment;
    const techTrends = marketEnv.technology_trends;
    
    const techData = techTrends.map(t => ({
      name: t.trend,
      value: t.relevance * 10
    }));
    
    return (
      <div className="datalake-content-full">
        <div className="datalake-chart-container">
          <h3 className="datalake-block-title">技术趋势分析</h3>
          
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>技术趋势</th>
                  <th>成熟度</th>
                  <th>采用率</th>
                  <th>相关性</th>
                </tr>
              </thead>
              <tbody>
                {techTrends.map((t, i) => (
                  <tr key={i}>
                    <td>{t.trend}</td>
                    <td>{(t.maturity * 100).toFixed(0)}%</td>
                    <td>{(t.adoption_rate * 100).toFixed(0)}%</td>
                    <td style={{
                      color: t.relevance >= 0.9 ? '#4be1a0' : 
                             t.relevance >= 0.8 ? '#36e2ec' : '#ffd666'
                    }}>
                      {(t.relevance * 10).toFixed(1)}/10
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <EChartsFeatureBar title="技术趋势相关性分析" features={techData} />
          
          <h3 className="datalake-block-title">客户行为分析</h3>
          <div className="datalake-customer-insights">
            <div className="datalake-info-card">
              <div className="datalake-info-title">客户分析</div>
              <div className="datalake-info-content">
                <div className="datalake-metrics-grid">
                  <div className="datalake-metric-item">
                    <span className="datalake-metric-label">数字化采用率:</span>
                    <span className="datalake-metric-value">{(marketEnv.customer_behavior.digital_adoption * 100).toFixed(0)}%</span>
                  </div>
                  <div className="datalake-metric-item">
                    <span className="datalake-metric-label">数据驱动决策率:</span>
                    <span className="datalake-metric-value">{(marketEnv.customer_behavior.data_driven_decision * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                <div className="datalake-preference-section">
                  <div className="datalake-preference-title">服务偏好</div>
                  <div className="datalake-preference-tags">
                    {marketEnv.customer_behavior.service_preference.map((p, i) => (
                      <span key={i} className="datalake-tag">{p}</span>
                    ))}
                  </div>
                </div>
                
                <div className="datalake-preference-section">
                  <div className="datalake-preference-title">购买因素</div>
                  <div className="datalake-preference-tags">
                    {marketEnv.customer_behavior.purchase_factors.map((p, i) => (
                      <span key={i} className="datalake-tag">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 根据数据类型和层级渲染不同内容
  const renderContent = () => {
    if (loading) {
      return <div className="datalake-loading">数据加载中...</div>;
    }

    if (error) {
      return <div className="datalake-error">加载错误: {error}</div>;
    }

    if (!data) {
      return <div className="datalake-loading">正在准备数据...</div>;
    }

    try {
      // 根据数据层级和类型渲染不同内容
      if (layer === 'feature') {
        return <div className="datalake-chart-container">{renderFeatureChart(data)}</div>;
      }

      if (layer === 'analysis') {
        // 检查是否是analysis_dashboard格式的数据，如果是则使用AuditAnalysisView
        if (data.data_format === 'analysis_dashboard') {
          return <AuditAnalysisView data={data} dataType={dataType} />;
        }
        
        // 为其他格式使用原有逻辑
        if (dataType === 'finance') return renderFinanceDashboard(data);
        if (dataType === 'operation') return renderOperationDashboard(data);
        if (dataType === 'opinion') return renderOpinionDashboard(data);
        if (dataType === 'macro') return renderMacroAnalysis(data);
        if (dataType === 'external') return renderExternalAnalysis(data);
        
        // 默认渲染结果表格
        if (data.results) {
          return (
            <div className="datalake-chart-container">
              <h3 className="datalake-block-title">模型分析结果</h3>
              {renderTable(data.results)}
            </div>
          );
        }
      }

      // Raw数据层根据类型渲染
      if (layer === 'raw') {
        if (dataType === 'finance' && data.table) {
          return (
            <div className="datalake-content-full">
              <div className="datalake-chart-container">
                {renderFinanceChart(data)}
                {renderTable(data.table)}
              </div>
            </div>
          );
        }
        
        if (dataType === 'operation' && data.timeseries) {
          return (
            <div className="datalake-content-full">
              <div className="datalake-chart-container">
                {renderOperationChart(data)}
                {renderTimeSeries(data.timeseries, data.operational_events)}
              </div>
            </div>
          );
        }
        
        if (dataType === 'opinion' && data.news) {
          return (
            <div className="datalake-content-full">
              <div className="datalake-chart-container">
                {renderText(data.news, data.social_comments)}
              </div>
            </div>
          );
        }
        
        if (dataType === 'macro' && data.indicators) {
          return (
            <div className="datalake-content-full">
              <div className="datalake-chart-container">
                {renderMacroChart(data)}
                {renderMacro(data)}
              </div>
            </div>
          );
        }
        
        if (dataType === 'external') {
          return (
            <div className="datalake-content-full">
              <div className="datalake-chart-container">
                {renderExternal(data)}
              </div>
            </div>
          );
        }
      }

      // 默认渲染
      return <div className="datalake-no-data">无法识别的数据格式</div>;
    } catch (e) {
      console.error("渲染内容时出错:", e);
      return <div className="datalake-error">渲染出错: {e.message}</div>;
    }
  };

  return (
    <div className="datalake-root" style={{ paddingTop: 90 }}>
      <div className="datalake-wrapper">
        <div className="datalake-header">
          <div className="datalake-title">AURA 数据湖</div>
          {/* 移除原有的公司类型切换按钮，使用Header中的按钮替代 */}
        </div>
        
        <div className="datalake-type-tabs">
          {DATA_TYPES.map(t => (
            <button 
              key={t.id} 
              className={t.id === dataType ? 'active' : ''}
              onClick={() => handleDataTypeChange(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
        
        <div className="datalake-layer-tabs">
          {DATA_LAYERS.map(l => (
            <button 
              key={l.id} 
              className={l.id === layer ? 'active' : ''}
              onClick={() => handleLayerChange(l.id)}
            >
              {l.name}
            </button>
          ))}
        </div>
        
        <div className="datalake-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default DataLake; 