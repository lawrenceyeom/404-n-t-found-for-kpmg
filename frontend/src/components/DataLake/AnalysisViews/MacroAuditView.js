import React from 'react';
import '../DataLake.css';

const MacroAuditView = ({ data }) => {
  if (!data) {
    return <div className="datalake-no-data">未找到宏观经济审计分析数据或数据不完整</div>;
  }
  
  // 检测数据结构类型（通用判断逻辑）
  const isAuraFormat = data.industry_indicators || data.regional_comparison;
  const isBetaCrisisFormat = data.economic_indicators || data.industry_conditions;
  
  // 如果是Beta/Crisis格式，渲染对应的视图
  if (isBetaCrisisFormat) {
    return renderBetaCrisisView(data);
  }
  
  // 默认渲染Aura格式
  return renderAuraView(data);
};

// Beta和Crisis公司的宏观数据视图
const renderBetaCrisisView = (data) => {
  const economic = data.economic_indicators || {};
  const industry = data.industry_conditions || {};
  const audit = data.audit_analysis || {};
  
  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">宏观经济审计分析</h3>
      
      {/* 经济指标概览 */}
      {economic && Object.keys(economic).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">经济指标概览</h4>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>数值</th>
                  <th>趋势</th>
                  <th>影响</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(economic).map(([key, value], idx) => (
                  <tr key={idx}>
                    <td>{getIndicatorName(key)}</td>
                    <td>{formatValue(value.value)}</td>
                    <td>{value.trend}</td>
                    <td>{value.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 行业状况 */}
      {industry && Object.keys(industry).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">行业状况</h4>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>指标</th>
                  <th>数值</th>
                  <th>趋势</th>
                  <th>影响</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(industry).map(([key, value], idx) => (
                  <tr key={idx}>
                    <td>{getIndicatorName(key)}</td>
                    <td>{formatValue(value.value)}</td>
                    <td>{value.trend}</td>
                    <td>{value.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 宏观风险暴露 */}
      {audit.macro_risk_exposure && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">宏观风险评估</h4>
          <div className="datalake-audit-grid-2col">
            {Object.entries(audit.macro_risk_exposure).map(([key, value], idx) => (
              <div key={idx} className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">{getIndicatorName(key)}</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">评估:</span>
                  <span className="datalake-audit-item-value">{value.assessment}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">影响:</span>
                  <span className="datalake-audit-item-value">{value.implications}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">审计重点:</span>
                  <span className="datalake-audit-item-value">{value.audit_focus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 经济情景分析 */}
      {audit.economic_scenario_analysis && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">经济情景分析</h4>
          <div className="datalake-audit-grid">
            {Object.entries(audit.economic_scenario_analysis).map(([key, value], idx) => (
              <div key={idx} className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">{getScenarioName(key)} ({(value.probability * 100).toFixed(0)}%)</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">描述:</span>
                  <span className="datalake-audit-item-value">{value.description}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">影响:</span>
                  <span className="datalake-audit-item-value">{value.impact}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">监控指标:</span>
                  <div className="datalake-audit-tags">
                    {value.key_indicators_to_monitor?.map((indicator, i) => (
                      <span key={i} className="datalake-audit-tag">{indicator}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Aura公司的宏观数据视图
const renderAuraView = (data) => {
  // 适配新的数据结构
  const audit_analysis = data.audit_analysis || {};
  const industry_indicators = data.industry_indicators || {};
  const regional_comparison = data.regional_comparison || [];
  const forecast_scenarios = data.forecast_scenarios || [];

  // 宏观经济风险评估部分
  const macro_risk = audit_analysis.macroeconomic_risk_assessment || {};
  const industry_analysis = audit_analysis.industry_specific_analysis || {};
  const fx_impact = audit_analysis.foreign_exchange_impact || {};
  const going_concern = audit_analysis.going_concern_macro_factors || {};
  const policy_env = audit_analysis.policy_and_regulatory_environment || {};

  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">宏观经济审计分析</h3>
      
      {/* 行业指标概览 */}
      {industry_indicators && Object.keys(industry_indicators).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">行业指标概览</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">行业关键指标</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">市场规模:</span>
                <span className="datalake-audit-item-value">{industry_indicators.market_size?.toLocaleString() || 'N/A'} 元</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">市场增长率:</span>
                <span className="datalake-audit-item-value">{(industry_indicators.market_growth * 100)?.toFixed(1) || 'N/A'}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">竞争强度:</span>
                <span className="datalake-audit-item-value">{(industry_indicators.competitive_intensity * 10)?.toFixed(1) || 'N/A'}/10</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">进入壁垒:</span>
                <span className="datalake-audit-item-value">{(industry_indicators.entry_barriers * 10)?.toFixed(1) || 'N/A'}/10</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">技术采用率:</span>
                <span className="datalake-audit-item-value">{(industry_indicators.technology_adoption * 10)?.toFixed(1) || 'N/A'}/10</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">行业生命周期:</span>
                <span className="datalake-audit-item-value">{industry_indicators.industry_lifecycle || 'N/A'}</span>
              </div>
            </div>
            
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">关键增长领域</h5>
              <div className="datalake-audit-tags">
                {industry_indicators.key_growth_segments?.map((segment, idx) => (
                  <span key={idx} className="datalake-audit-tag">{segment}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 区域比较 */}
      {regional_comparison && regional_comparison.length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">区域比较分析</h4>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>区域</th>
                  <th>GDP增长</th>
                  <th>行业集中度</th>
                  <th>市场潜力</th>
                  <th>竞争地位</th>
                  <th>政策环境</th>
                </tr>
              </thead>
              <tbody>
                {regional_comparison.map((region, idx) => (
                  <tr key={idx}>
                    <td>{region.region}</td>
                    <td>{(region.gdp_growth * 100).toFixed(1)}%</td>
                    <td>{(region.industry_concentration * 100).toFixed(0)}%</td>
                    <td>{(region.market_potential * 10).toFixed(1)}/10</td>
                    <td>{region.competitive_position}</td>
                    <td>{region.policy_environment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 经济周期位置 */}
      {macro_risk.economic_cycle_position && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">宏观经济风险评估</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">经济周期位置</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">当前阶段:</span>
                <span className="datalake-audit-item-value">{macro_risk.economic_cycle_position.current_phase || 'N/A'}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">对行业影响:</span>
                <span className="datalake-audit-item-value">{macro_risk.economic_cycle_position.impact_on_industry || 'N/A'}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">关键指标:</span>
                <div className="datalake-audit-list">
                  {macro_risk.economic_cycle_position.key_indicators?.map((indicator, idx) => (
                    <div key={idx} className="datalake-audit-list-item">{indicator}</div>
                  ))}
                </div>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">审计含义:</span>
                <span className="datalake-audit-item-value">{macro_risk.economic_cycle_position.audit_implication || 'N/A'}</span>
              </div>
            </div>
            
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">货币政策影响</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">当前政策立场:</span>
                <span className="datalake-audit-item-value">{macro_risk.monetary_policy_impact?.current_policy_stance || 'N/A'}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">利率趋势:</span>
                <span className="datalake-audit-item-value">{macro_risk.monetary_policy_impact?.interest_rate_trend || 'N/A'}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">流动性状况:</span>
                <span className="datalake-audit-item-value">{macro_risk.monetary_policy_impact?.liquidity_condition || 'N/A'}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">审计含义:</span>
                <span className="datalake-audit-item-value">{macro_risk.monetary_policy_impact?.audit_implication || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 财政政策和行业法规 */}
      {(macro_risk.fiscal_policy_impact || macro_risk.industry_regulation_shifts) && (
        <div className="datalake-audit-section">
          <div className="datalake-audit-grid-2col">
            {macro_risk.fiscal_policy_impact && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">财政政策影响</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">当前政策立场:</span>
                  <span className="datalake-audit-item-value">{macro_risk.fiscal_policy_impact.current_policy_stance || 'N/A'}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">关键举措:</span>
                  <div className="datalake-audit-list">
                    {macro_risk.fiscal_policy_impact.key_initiatives?.map((initiative, idx) => (
                      <div key={idx} className="datalake-audit-list-item">{initiative}</div>
                    ))}
                  </div>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">受益行业:</span>
                  <div className="datalake-audit-tags">
                    {macro_risk.fiscal_policy_impact.sector_benefits?.map((sector, idx) => (
                      <span key={idx} className="datalake-audit-tag">{sector}</span>
                    ))}
                  </div>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">审计含义:</span>
                  <span className="datalake-audit-item-value">{macro_risk.fiscal_policy_impact.audit_implication || 'N/A'}</span>
                </div>
              </div>
            )}
            
            {macro_risk.industry_regulation_shifts && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">行业监管变化</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">趋势:</span>
                  <span className="datalake-audit-item-value">{macro_risk.industry_regulation_shifts.trend || 'N/A'}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">关键领域:</span>
                  <div className="datalake-audit-tags">
                    {macro_risk.industry_regulation_shifts.key_areas?.map((area, idx) => (
                      <span key={idx} className="datalake-audit-tag">{area}</span>
                    ))}
                  </div>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">合规成本影响:</span>
                  <span className="datalake-audit-item-value">{macro_risk.industry_regulation_shifts.compliance_cost_impact || 'N/A'}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">审计含义:</span>
                  <span className="datalake-audit-item-value">{macro_risk.industry_regulation_shifts.audit_implication || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 持续经营的宏观因素 */}
      {going_concern && Object.keys(going_concern).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">持续经营的宏观因素</h4>
          <div className="datalake-audit-card">
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">行业前景:</span>
              <span className="datalake-audit-item-value">{going_concern.industry_outlook || 'N/A'}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">关键依赖因素:</span>
              <div className="datalake-audit-list">
                {going_concern.critical_dependencies?.map((dep, idx) => (
                  <div key={idx} className="datalake-audit-list-item">{dep}</div>
                ))}
              </div>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">压力测试情景:</span>
              <div className="datalake-stress-tests">
                {going_concern.stress_test_scenarios?.map((test, idx) => (
                  <div key={idx} className="datalake-stress-test">
                    <div className="datalake-stress-test-scenario">{test.scenario}</div>
                    <div className="datalake-stress-test-impact">影响: {test.impact}</div>
                    <div className="datalake-stress-test-mitigating">缓解因素: {test.mitigating_factors}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">审计含义:</span>
              <span className="datalake-audit-item-value">{going_concern.audit_implication || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 政策和监管环境 */}
      {policy_env && Object.keys(policy_env).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">政策和监管环境</h4>
          <div className="datalake-audit-card">
            <h5 className="datalake-audit-card-title">近期政策变化</h5>
            <div className="datalake-policy-changes">
              {policy_env.key_recent_changes?.map((change, idx) => (
                <div key={idx} className="datalake-policy-change">
                  <div className="datalake-policy-name">{change.policy}</div>
                  <div className="datalake-policy-date">生效日期: {change.effective_date}</div>
                  <div className="datalake-policy-status">合规状态: {change.compliance_status}</div>
                  <div className="datalake-policy-impact">业务影响: {change.business_impact}</div>
                </div>
              ))}
            </div>
            
            <h5 className="datalake-audit-card-title mt-4">待定立法</h5>
            <div className="datalake-policy-changes">
              {policy_env.pending_legislation?.map((legislation, idx) => (
                <div key={idx} className="datalake-policy-change">
                  <div className="datalake-policy-name">{legislation.policy}</div>
                  <div className="datalake-policy-date">预期日期: {legislation.expected_date}</div>
                  <div className="datalake-policy-impact">潜在影响: {legislation.potential_impact}</div>
                  <div className="datalake-policy-status">准备状态: {legislation.preparedness}</div>
                </div>
              ))}
            </div>
            
            <div className="datalake-audit-item mt-3">
              <span className="datalake-audit-item-label">审计含义:</span>
              <span className="datalake-audit-item-value">{policy_env.audit_implication || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助函数：根据指标键名获取显示名称
const getIndicatorName = (key) => {
  const nameMap = {
    gdp_growth: "GDP增长率",
    interest_rate: "利率",
    inflation_rate: "通胀率",
    unemployment_rate: "失业率",
    currency_exchange: "汇率",
    market_growth: "市场增长",
    competitive_intensity: "竞争强度",
    technology_evolution: "技术演进",
    regulatory_environment: "监管环境",
    industry_cycle_position: "行业周期位置",
    interest_rate_sensitivity: "利率敏感性",
    regulatory_change_exposure: "监管变化敏感度",
    technology_disruption_risk: "技术颠覆风险"
  };
  
  return nameMap[key] || key;
};

// 辅助函数：根据情景键名获取显示名称
const getScenarioName = (key) => {
  const nameMap = {
    base_case: "基准情景",
    upside_case: "乐观情景",
    downside_case: "悲观情景"
  };
  
  return nameMap[key] || key;
};

// 辅助函数：格式化显示值
const formatValue = (value) => {
  if (typeof value === 'number') {
    // 如果是百分比数据（小于100的数字），显示百分号
    if (value < 100 && value > 0) {
      return value.toFixed(1) + '%';
    }
    // 其他数字正常显示
    return value.toLocaleString();
  }
  // 非数字值直接返回
  return value;
};

export default MacroAuditView; 