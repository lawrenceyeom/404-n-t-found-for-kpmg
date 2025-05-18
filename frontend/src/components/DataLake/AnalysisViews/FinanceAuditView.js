import React from 'react';
import '../DataLake.css';

const RiskLevelBadge = ({ level }) => {
  const colorMap = {
    '高': '#ff5c5c',
    '中等': '#ffd666', 
    '低': '#4be1a0',
    '无': '#4be1a0'
  };
  
  return (
    <span className="datalake-risk-badge" style={{ backgroundColor: colorMap[level] || '#ffd666' }}>
      {level}
    </span>
  );
};

const FinanceAuditView = ({ data }) => {
  if (!data || !data.audit_analysis) {
    return <div className="datalake-no-data">未找到财务审计分析数据</div>;
  }
  
  const audit_analysis = data.audit_analysis || {};
  const financial_ratios = data.financial_ratios || {};

  const hasKeyRiskAreas = audit_analysis.key_risk_areas && Array.isArray(audit_analysis.key_risk_areas);
  const hasGoingConcern = audit_analysis.going_concern && typeof audit_analysis.going_concern === 'object';
  const hasInternalControl = audit_analysis.internal_control && typeof audit_analysis.internal_control === 'object';
  const hasIcSignificantDeficiencies = hasInternalControl && audit_analysis.internal_control.significant_deficiencies && Array.isArray(audit_analysis.internal_control.significant_deficiencies);
  const hasAnalyticalProcedures = audit_analysis.analytical_procedures && typeof audit_analysis.analytical_procedures === 'object';
  const hasApRevenueTrend = hasAnalyticalProcedures && audit_analysis.analytical_procedures.revenue_trend && typeof audit_analysis.analytical_procedures.revenue_trend === 'object';
  const hasApExpenseTrend = hasAnalyticalProcedures && audit_analysis.analytical_procedures.expense_trend && typeof audit_analysis.analytical_procedures.expense_trend === 'object';
  const hasApUnusualTransactions = hasAnalyticalProcedures && audit_analysis.analytical_procedures.unusual_transactions && Array.isArray(audit_analysis.analytical_procedures.unusual_transactions);
  
  const profitability = financial_ratios.profitability || {};
  const liquidity = financial_ratios.liquidity || {};
  const solvency = financial_ratios.solvency || {};
  const efficiency = financial_ratios.efficiency || {};

  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">财务审计分析</h3>
      
      {/* 审计关键风险区域 */}
      {hasKeyRiskAreas && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">关键风险区域</h4>
          <div className="datalake-audit-risk-grid">
            {audit_analysis.key_risk_areas.map((risk, index) => (
              risk && typeof risk === 'object' && (
                <div key={index} className="datalake-audit-risk-card">
                  <div className="datalake-audit-risk-header">
                    <span className="datalake-audit-risk-area">{risk.area}</span>
                    <RiskLevelBadge level={risk.risk_level} />
                  </div>
                  <div className="datalake-audit-risk-content">
                    <p className="datalake-audit-risk-description">{risk.description}</p>
                    <div className="datalake-audit-risk-focus">
                      <span className="datalake-audit-label">审计关注点:</span>
                      <span>{risk.audit_focus}</span>
                    </div>
                    <div className="datalake-audit-risk-misstatement">
                      <span className="datalake-audit-label">潜在错报风险:</span>
                      <span>{risk.potential_misstatement}</span>
                    </div>
                  </div>
                  <div className="datalake-audit-recommendation">
                    <span className="datalake-audit-label">建议:</span>
                    <span>{risk.recommendation}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}
      
      {/* 持续经营评估 */}
      {hasGoingConcern && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">持续经营评估</h4>
          <div className="datalake-audit-going-concern">
            <div className="datalake-audit-status-card">
              <div className="datalake-audit-status-header">
                <span className="datalake-audit-label">状态:</span>
                <span className="datalake-audit-status">
                  {audit_analysis.going_concern.status}
                </span>
              </div>
              <div className="datalake-audit-metrics">
                <div className="datalake-audit-metric">
                  <span className="datalake-audit-label">流动性:</span>
                  <span>{audit_analysis.going_concern.liquidity_assessment}</span>
                </div>
                <div className="datalake-audit-metric">
                  <span className="datalake-audit-label">偿债能力:</span>
                  <span>{audit_analysis.going_concern.debt_service_capability}</span>
                </div>
                <div className="datalake-audit-metric">
                  <span className="datalake-audit-label">经营指标:</span>
                  <span>{audit_analysis.going_concern.operational_indicators}</span>
                </div>
              </div>
              <div className="datalake-audit-analysis-text">
                {audit_analysis.going_concern.analysis}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 内部控制评估 */}
      {hasInternalControl && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">内部控制评估</h4>
          <div className="datalake-audit-internal-control">
            <div className="datalake-audit-ic-summary">
              <div className="datalake-audit-ic-metric">
                <span className="datalake-audit-label">总体评估:</span>
                <span className="datalake-audit-ic-value">{audit_analysis.internal_control.overall_assessment}</span>
              </div>
              <div className="datalake-audit-ic-metric">
                <span className="datalake-audit-label">控制环境:</span>
                <span>{audit_analysis.internal_control.control_environment}</span>
              </div>
              <div className="datalake-audit-ic-metric">
                <span className="datalake-audit-label">风险评估流程:</span>
                <span>{audit_analysis.internal_control.risk_assessment_process}</span>
              </div>
              <div className="datalake-audit-ic-metric">
                <span className="datalake-audit-label">信息系统:</span>
                <span>{audit_analysis.internal_control.information_system}</span>
              </div>
            </div>
            
            {hasIcSignificantDeficiencies && audit_analysis.internal_control.significant_deficiencies.length > 0 && (
              <div className="datalake-audit-deficiencies">
                <h5 className="datalake-audit-subtitle">重要缺陷</h5>
                <div className="datalake-table-container">
                  <table className="datalake-table">
                    <thead>
                      <tr>
                        <th>领域</th>
                        <th>描述</th>
                        <th>影响程度</th>
                        <th>改进建议</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit_analysis.internal_control.significant_deficiencies.map((deficiency, index) => (
                        deficiency && typeof deficiency === 'object' && (
                          <tr key={index}>
                            <td>{deficiency.area}</td>
                            <td>{deficiency.description}</td>
                            <td>{deficiency.impact}</td>
                            <td>{deficiency.recommendation}</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 分析性程序 */}
      {hasAnalyticalProcedures && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">分析性程序</h4>
          <div className="datalake-audit-analytical">
            {hasApRevenueTrend && hasApExpenseTrend && (
              <div className="datalake-audit-trend-cards">
                <div className="datalake-audit-trend-card">
                  <h5 className="datalake-audit-trend-title">收入趋势</h5>
                  <div className="datalake-audit-trend-assessment">
                    评估: <span>{audit_analysis.analytical_procedures.revenue_trend.assessment}</span>
                  </div>
                  <p className="datalake-audit-trend-explanation">
                    {audit_analysis.analytical_procedures.revenue_trend.explanation}
                  </p>
                </div>
                
                <div className="datalake-audit-trend-card">
                  <h5 className="datalake-audit-trend-title">费用趋势</h5>
                  <div className="datalake-audit-trend-assessment">
                    评估: <span>{audit_analysis.analytical_procedures.expense_trend.assessment}</span>
                  </div>
                  <p className="datalake-audit-trend-explanation">
                    {audit_analysis.analytical_procedures.expense_trend.explanation}
                  </p>
                </div>
              </div>
            )}
            
            {hasApUnusualTransactions && audit_analysis.analytical_procedures.unusual_transactions.length > 0 && (
              <div className="datalake-audit-unusual">
                <h5 className="datalake-audit-subtitle">异常交易</h5>
                <div className="datalake-table-container">
                  <table className="datalake-table">
                    <thead>
                      <tr>
                        <th>描述</th>
                        <th>重要性</th>
                        <th>结论</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit_analysis.analytical_procedures.unusual_transactions.map((transaction, index) => (
                        transaction && typeof transaction === 'object' && (
                          <tr key={index}>
                            <td>{transaction.description}</td>
                            <td>{transaction.materiality}</td>
                            <td>{transaction.conclusion}</td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 关键财务比率 */}
      {financial_ratios && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">关键财务比率分析</h4>
          <div className="datalake-audit-ratios">
            {profitability && (
              <div className="datalake-ratio-section">
                <h5 className="datalake-audit-subtitle">盈利能力</h5>
                <div className="datalake-ratio-grid">
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">毛利率</div>
                    <div className="datalake-ratio-value">{typeof profitability.gross_margin === 'number' ? (profitability.gross_margin * 100).toFixed(1) + '%' : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">营业利润率</div>
                    <div className="datalake-ratio-value">{typeof profitability.operating_margin === 'number' ? (profitability.operating_margin * 100).toFixed(1) + '%' : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">净利率</div>
                    <div className="datalake-ratio-value">{typeof profitability.net_profit_margin === 'number' ? (profitability.net_profit_margin * 100).toFixed(1) + '%' : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">ROE</div>
                    <div className="datalake-ratio-value">{typeof profitability.return_on_equity === 'number' ? (profitability.return_on_equity * 100).toFixed(1) + '%' : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {liquidity && solvency && (
              <div className="datalake-ratio-section">
                <h5 className="datalake-audit-subtitle">流动性与偿债能力</h5>
                <div className="datalake-ratio-grid">
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">流动比率</div>
                    <div className="datalake-ratio-value">{typeof liquidity.current_ratio === 'number' ? liquidity.current_ratio.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">速动比率</div>
                    <div className="datalake-ratio-value">{typeof liquidity.quick_ratio === 'number' ? liquidity.quick_ratio.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">资产负债率</div>
                    <div className="datalake-ratio-value">{typeof solvency.debt_ratio === 'number' ? (solvency.debt_ratio * 100).toFixed(1) + '%' : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">利息覆盖率</div>
                    <div className="datalake-ratio-value">{typeof solvency.interest_coverage === 'number' ? solvency.interest_coverage.toFixed(1) : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
            
            {efficiency && (
              <div className="datalake-ratio-section">
                <h5 className="datalake-audit-subtitle">运营效率</h5>
                <div className="datalake-ratio-grid">
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">资产周转率</div>
                    <div className="datalake-ratio-value">{typeof efficiency.asset_turnover === 'number' ? efficiency.asset_turnover.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">存货周转率</div>
                    <div className="datalake-ratio-value">{typeof efficiency.inventory_turnover === 'number' ? efficiency.inventory_turnover.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">应收账款周转率</div>
                    <div className="datalake-ratio-value">{typeof efficiency.receivable_turnover === 'number' ? efficiency.receivable_turnover.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="datalake-ratio-card">
                    <div className="datalake-ratio-title">应付账款周转率</div>
                    <div className="datalake-ratio-value">{typeof efficiency.accounts_payable_turnover === 'number' ? efficiency.accounts_payable_turnover.toFixed(2) : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceAuditView; 