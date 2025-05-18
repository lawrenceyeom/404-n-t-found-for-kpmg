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

const OperationAuditView = ({ data }) => {
  if (!data || !data.audit_analysis) {
    return <div className="datalake-no-data">未找到运营审计分析数据</div>;
  }
  
  // 检查必需的数据结构是否存在
  const hasOperationalRisks = data.audit_analysis.operational_risks && Array.isArray(data.audit_analysis.operational_risks);
  const hasInternalControl = data.audit_analysis.internal_control_assessment && typeof data.audit_analysis.internal_control_assessment === 'object';
  const hasEfficiencyAnalysis = data.audit_analysis.efficiency_analysis && typeof data.audit_analysis.efficiency_analysis === 'object';
  const hasBusinessContinuity = data.audit_analysis.business_continuity && typeof data.audit_analysis.business_continuity === 'object';
  const hasDepartments = data.departments && Array.isArray(data.departments);
  const hasKpiSummary = data.kpi_summary && typeof data.kpi_summary === 'object';
  
  const { audit_analysis, kpi_summary, departments } = data;
  
  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">运营审计分析</h3>
      
      {/* 运营风险评估 */}
      {hasOperationalRisks && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">运营风险评估</h4>
          <div className="datalake-audit-risk-grid">
            {audit_analysis.operational_risks.map((risk, index) => (
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
                    <span className="datalake-audit-label">潜在影响:</span>
                    <span>{risk.potential_impact}</span>
                  </div>
                </div>
                <div className="datalake-audit-recommendation">
                  <span className="datalake-audit-label">建议:</span>
                  <span>{risk.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 内控评估 */}
      {hasInternalControl && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">内部控制评估</h4>
          
          <div className="datalake-audit-grid-2col">
            {Object.entries(audit_analysis.internal_control_assessment).map(([cycle, assessment], index) => (
              <div key={index} className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">
                  {cycle === 'procurement_cycle' ? '采购循环' :
                   cycle === 'production_cycle' ? '生产循环' :
                   cycle === 'inventory_cycle' ? '库存循环' :
                   cycle === 'logistics_cycle' ? '物流循环' : cycle}
                </h5>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">控制有效性:</span>
                  <span className="datalake-audit-item-value">{assessment.control_effectiveness}</span>
                </div>
                
                {assessment.key_controls && Array.isArray(assessment.key_controls) && (
                  <div className="datalake-audit-item">
                    <span className="datalake-audit-item-label">关键控制点:</span>
                    <div className="datalake-audit-tags">
                      {assessment.key_controls.map((control, idx) => (
                        <span key={idx} className="datalake-audit-tag">{control}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {assessment.weaknesses && Array.isArray(assessment.weaknesses) && assessment.weaknesses.length > 0 && (
                  <div className="datalake-audit-item">
                    <span className="datalake-audit-item-label">控制弱点:</span>
                    <div className="datalake-audit-tags">
                      {assessment.weaknesses.map((weakness, idx) => (
                        <span key={idx} className="datalake-audit-tag" style={{backgroundColor: '#fff3f0', color: '#ff7875'}}>
                          {weakness}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">改进建议:</span>
                  <span className="datalake-audit-item-value">{assessment.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 效率分析 */}
      {hasEfficiencyAnalysis && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">效率分析</h4>
          
          <div className="datalake-audit-grid-2col">
            {Object.entries(audit_analysis.efficiency_analysis).map(([metric, analysis], index) => (
              <div key={index} className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">
                  {metric === 'capacity_utilization' ? '产能利用率' :
                   metric === 'labor_productivity' ? '劳动生产率' :
                   metric === 'asset_efficiency' ? '资产效率' :
                   metric === 'energy_consumption' ? '能源消耗' : metric}
                </h5>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">当前值:</span>
                  <span className="datalake-audit-item-value">{analysis.current}</span>
                </div>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">行业标准:</span>
                  <span className="datalake-audit-item-value">{analysis.industry_benchmark}</span>
                </div>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">趋势:</span>
                  <span className="datalake-audit-item-value">{analysis.trend}</span>
                </div>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">评估:</span>
                  <span className="datalake-audit-item-value">{analysis.assessment}</span>
                </div>
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">建议:</span>
                  <span className="datalake-audit-item-value">{analysis.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 业务连续性 */}
      {hasBusinessContinuity && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">业务连续性评估</h4>
          
          <div className="datalake-audit-status-card">
            <div className="datalake-audit-status-header">
              <span className="datalake-audit-label">风险评估:</span>
              <span className="datalake-audit-status">{audit_analysis.business_continuity.risk_assessment}</span>
            </div>
            
            {audit_analysis.business_continuity.key_dependencies && Array.isArray(audit_analysis.business_continuity.key_dependencies) && (
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">关键依赖项:</span>
                <div className="datalake-audit-tags">
                  {audit_analysis.business_continuity.key_dependencies.map((item, idx) => (
                    <span key={idx} className="datalake-audit-tag">{item}</span>
                  ))}
                </div>
              </div>
            )}
            
            {audit_analysis.business_continuity.mitigation_measures && Array.isArray(audit_analysis.business_continuity.mitigation_measures) && (
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">缓解措施:</span>
                <div className="datalake-audit-tags">
                  {audit_analysis.business_continuity.mitigation_measures.map((item, idx) => (
                    <span key={idx} className="datalake-audit-tag" style={{backgroundColor: '#f6ffed', color: '#52c41a'}}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {audit_analysis.business_continuity.improvement_areas && Array.isArray(audit_analysis.business_continuity.improvement_areas) && (
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">改进领域:</span>
                <div className="datalake-audit-tags">
                  {audit_analysis.business_continuity.improvement_areas.map((item, idx) => (
                    <span key={idx} className="datalake-audit-tag" style={{backgroundColor: '#fff7e6', color: '#fa8c16'}}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 部门绩效分析 */}
      {hasDepartments && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">部门绩效审计</h4>
          
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>部门</th>
                  <th>人数</th>
                  <th>绩效</th>
                  <th>成本(万元)</th>
                  <th>KPI达成率</th>
                  <th>风险等级</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, index) => (
                  <tr key={index}>
                    <td>{dept.name}</td>
                    <td>{dept.headcount}</td>
                    <td style={{
                      color: dept.performance >= 0.95 ? '#52c41a' :
                            dept.performance >= 0.9 ? '#fa8c16' : '#f5222d'
                    }}>
                      {(dept.performance * 100).toFixed(1)}%
                    </td>
                    <td>{(dept.cost / 10000).toFixed(0)}</td>
                    <td style={{
                      color: dept.kpi_achievement >= 1 ? '#52c41a' :
                            dept.kpi_achievement >= 0.9 ? '#fa8c16' : '#f5222d'
                    }}>
                      {(dept.kpi_achievement * 100).toFixed(1)}%
                    </td>
                    <td>
                      <RiskLevelBadge level={dept.risk_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* KPI总览 */}
      {hasKpiSummary && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">KPI审计总览</h4>
          
          <div className="datalake-ratio-grid">
            <div className="datalake-ratio-card">
              <div className="datalake-ratio-title">销售目标</div>
              <div className="datalake-ratio-value">{kpi_summary.sales_target.toLocaleString()}</div>
              <div className="datalake-ratio-title">实际销售</div>
              <div className="datalake-ratio-value" style={{
                color: kpi_summary.sales_achievement >= 1 ? '#52c41a' : '#f5222d'
              }}>
                {kpi_summary.sales_actual.toLocaleString()}
              </div>
              <div className="datalake-ratio-subtitle">达成率: {(kpi_summary.sales_achievement * 100).toFixed(1)}%</div>
            </div>
            
            <div className="datalake-ratio-card">
              <div className="datalake-ratio-title">生产目标</div>
              <div className="datalake-ratio-value">{kpi_summary.production_target.toLocaleString()}</div>
              <div className="datalake-ratio-title">实际生产</div>
              <div className="datalake-ratio-value" style={{
                color: kpi_summary.production_achievement >= 1 ? '#52c41a' : '#f5222d'
              }}>
                {kpi_summary.production_actual.toLocaleString()}
              </div>
              <div className="datalake-ratio-subtitle">达成率: {(kpi_summary.production_achievement * 100).toFixed(1)}%</div>
            </div>
            
            <div className="datalake-ratio-card">
              <div className="datalake-ratio-title">效率目标</div>
              <div className="datalake-ratio-value">{(kpi_summary.efficiency_target * 100).toFixed(1)}%</div>
              <div className="datalake-ratio-title">实际效率</div>
              <div className="datalake-ratio-value" style={{
                color: kpi_summary.efficiency_achievement >= 1 ? '#52c41a' : '#f5222d'
              }}>
                {(kpi_summary.efficiency_actual * 100).toFixed(1)}%
              </div>
              <div className="datalake-ratio-subtitle">达成率: {(kpi_summary.efficiency_achievement * 100).toFixed(1)}%</div>
            </div>
            
            <div className="datalake-ratio-card">
              <div className="datalake-ratio-title">缺陷率目标</div>
              <div className="datalake-ratio-value">{(kpi_summary.defect_target * 100).toFixed(2)}%</div>
              <div className="datalake-ratio-title">实际缺陷率</div>
              <div className="datalake-ratio-value" style={{
                color: kpi_summary.defect_achievement >= 1 ? '#52c41a' : '#f5222d'
              }}>
                {(kpi_summary.defect_actual * 100).toFixed(2)}%
              </div>
              <div className="datalake-ratio-subtitle">达成率: {(kpi_summary.defect_achievement * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationAuditView; 