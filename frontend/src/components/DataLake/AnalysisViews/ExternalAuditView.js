import React from 'react';
import '../DataLake.css';

const RiskLevelBadge = ({ level }) => {
  const colorMap = {
    '高': '#ff5c5c',
    '中高': '#ff8c5c',
    '中等': '#ffd666', 
    '中': '#ffd666',
    '低': '#4be1a0',
    '无': '#4be1a0'
  };
  
  return (
    <span className="datalake-risk-badge" style={{ backgroundColor: colorMap[level] || '#ffd666' }}>
      {level}
    </span>
  );
};

const ExternalAuditView = ({ data }) => {
  if (!data) {
    return <div className="datalake-no-data">未找到外部环境审计分析数据或数据不完整</div>;
  }
  
  // 检测数据结构类型
  const isAuraFormat = data.competitive_landscape && typeof data.competitive_landscape === 'object' && 
                       (data.supplier_analysis || data.customer_analysis);
  const isBetaCrisisFormat = data.market_position && data.customer_analysis && data.product_portfolio;
  
  // 根据数据格式选择对应的渲染方法
  if (isBetaCrisisFormat) {
    return renderBetaCrisisView(data);
  }
  
  // 默认Aura格式
  return renderAuraView(data);
};

// Beta/Crisis公司的外部环境分析视图
const renderBetaCrisisView = (data) => {
  const market = data.market_position || {};
  const customer = data.customer_analysis || {};
  const product = data.product_portfolio || {};
  const audit = data.audit_analysis || {};
  
  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">外部环境审计分析</h3>
      
      {/* 市场地位分析 */}
      {market && Object.keys(market).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">市场地位分析</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">市场份额</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">当前份额:</span>
                <span className="datalake-audit-item-value">{(market.market_share?.current * 100).toFixed(1)}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">行业排名:</span>
                <span className="datalake-audit-item-value">第 {market.market_share?.industry_rank || 'N/A'} 位</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">趋势:</span>
                <span className="datalake-audit-item-value">{market.market_share?.trend || 'N/A'}</span>
              </div>
            </div>
            
            {market.competitive_landscape && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">竞争优劣势</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">竞争优势:</span>
                  <div className="datalake-audit-tags">
                    {market.competitive_landscape.competitive_advantage?.map((adv, idx) => (
                      <span key={idx} className="datalake-audit-tag">{adv}</span>
                    ))}
                  </div>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">竞争劣势:</span>
                  <div className="datalake-audit-tags">
                    {market.competitive_landscape.competitive_disadvantage?.map((disadv, idx) => (
                      <span key={idx} className="datalake-audit-tag">{disadv}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 竞争对手分析 */}
          {market.competitive_landscape?.major_competitors && (
            <div className="datalake-audit-card mt-3">
              <h5 className="datalake-audit-card-title">主要竞争对手</h5>
              <div className="datalake-table-container">
                <table className="datalake-table">
                  <thead>
                    <tr>
                      <th>公司</th>
                      <th>市场份额</th>
                      <th>趋势</th>
                    </tr>
                  </thead>
                  <tbody>
                    {market.competitive_landscape.major_competitors.map((comp, idx) => (
                      <tr key={idx}>
                        <td>{comp.name}</td>
                        <td>{(comp.market_share * 100).toFixed(1)}%</td>
                        <td>{comp.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 客户分析 */}
      {customer && customer.customer_segments && customer.customer_segments.length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">客户分析</h4>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>客户群体</th>
                  <th>收入占比</th>
                  <th>增长率</th>
                  <th>留存率</th>
                  <th>盈利能力</th>
                </tr>
              </thead>
              <tbody>
                {customer.customer_segments.map((segment, idx) => (
                  <tr key={idx}>
                    <td>{segment.segment}</td>
                    <td>{(segment.revenue_percentage * 100).toFixed(0)}%</td>
                    <td>{(segment.growth_rate * 100).toFixed(0)}%</td>
                    <td>{(segment.retention_rate * 100).toFixed(0)}%</td>
                    <td>{segment.profitability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {customer.geographical_distribution && (
            <div className="datalake-audit-card mt-3">
              <h5 className="datalake-audit-card-title">地域分布</h5>
              <div className="datalake-audit-tags">
                {customer.geographical_distribution.map((geo, idx) => (
                  <span key={idx} className="datalake-audit-tag">
                    {geo.region}: {(geo.percentage * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 审计风险评估 */}
      {audit.strategic_risk_assessment && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">战略风险评估</h4>
          <div className="datalake-audit-grid">
            {Object.entries(audit.strategic_risk_assessment).map(([key, value], idx) => (
              <div key={idx} className="datalake-audit-card">
                <div className="datalake-audit-risk-header">
                  <h5 className="datalake-audit-card-title">{getRiskName(key)}</h5>
                  <RiskLevelBadge level={value.assessment.replace("风险", "")} />
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">主要发现:</span>
                  <div className="datalake-audit-list">
                    {value.key_findings?.map((finding, i) => (
                      <div key={i} className="datalake-audit-list-item">{finding}</div>
                    ))}
                  </div>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">潜在影响:</span>
                  <span className="datalake-audit-item-value">{value.potential_impact}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">建议:</span>
                  <span className="datalake-audit-item-value">{value.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 监管环境影响 */}
      {audit.regulatory_environment_impact?.regulatory_challenges && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">监管环境挑战</h4>
          <div className="datalake-table-container">
            <table className="datalake-table">
              <thead>
                <tr>
                  <th>领域</th>
                  <th>影响</th>
                  <th>合规状态</th>
                  <th>所需行动</th>
                </tr>
              </thead>
              <tbody>
                {audit.regulatory_environment_impact.regulatory_challenges.map((challenge, idx) => (
                  <tr key={idx}>
                    <td>{challenge.area}</td>
                    <td>{challenge.impact}</td>
                    <td>{challenge.compliance_status}</td>
                    <td>{challenge.action_required}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Aura公司的外部环境分析视图
const renderAuraView = (data) => {
  // 适配新的数据结构
  const competitive_landscape = data.competitive_landscape || {};
  const supplier_analysis = data.supplier_analysis || {};
  const customer_analysis = data.customer_analysis || {};
  const audit_analysis = data.audit_analysis || {};
  
  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">外部环境审计分析</h3>
      
      {/* 竞争格局分析 */}
      {competitive_landscape && Object.keys(competitive_landscape).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">竞争格局分析</h4>
          <div className="datalake-audit-grid-2col">
            {competitive_landscape.market_position && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">市场地位</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">市场份额:</span>
                  <span className="datalake-audit-item-value">{(competitive_landscape.market_position.market_share * 100).toFixed(1)}%</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">行业排名:</span>
                  <span className="datalake-audit-item-value">第 {competitive_landscape.market_position.rank} 位</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">趋势:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.market_position.trend}</span>
                </div>
                
                <h6 className="datalake-audit-subtitle mt-3">主要竞争对手</h6>
                <div className="datalake-table-container">
                  <table className="datalake-table">
                    <thead>
                      <tr>
                        <th>公司</th>
                        <th>份额</th>
                        <th>优势</th>
                        <th>劣势</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitive_landscape.market_position.key_competitors?.map((competitor, idx) => (
                        <tr key={idx}>
                          <td>{competitor.name}</td>
                          <td>{(competitor.market_share * 100).toFixed(1)}%</td>
                          <td>{competitor.strength}</td>
                          <td>{competitor.weakness}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {competitive_landscape.competitive_dynamics && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">竞争动态</h5>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">价格竞争:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.competitive_dynamics.price_competition}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">服务差异化:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.competitive_dynamics.service_differentiation}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">创新步伐:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.competitive_dynamics.innovation_pace}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">进入壁垒:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.competitive_dynamics.entry_barriers}</span>
                </div>
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">整合趋势:</span>
                  <span className="datalake-audit-item-value">{competitive_landscape.competitive_dynamics.consolidation_trend}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 供应商分析 */}
      {supplier_analysis && Object.keys(supplier_analysis).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">供应商分析</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">供应商集中度</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">前5供应商集中度:</span>
                <span className="datalake-audit-item-value">{(supplier_analysis.supplier_concentration?.top_5_concentration * 100).toFixed(0)}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">前10供应商集中度:</span>
                <span className="datalake-audit-item-value">{(supplier_analysis.supplier_concentration?.top_10_concentration * 100).toFixed(0)}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">风险评估:</span>
                <span className="datalake-audit-item-value">{supplier_analysis.supplier_concentration?.risk_assessment}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">趋势:</span>
                <span className="datalake-audit-item-value">{supplier_analysis.supplier_concentration?.trend}</span>
              </div>
            </div>
            
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">供应链风险</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">地域集中度:</span>
                <div className="datalake-audit-item-value">
                  {supplier_analysis.supply_chain_risks?.geographic_concentration && (
                    <div className="datalake-audit-tags">
                      {Object.entries(supplier_analysis.supply_chain_risks.geographic_concentration).map(([region, value], idx) => (
                        <span key={idx} className="datalake-audit-tag">
                          {region}: {(value * 100).toFixed(0)}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">中断风险:</span>
                <span className="datalake-audit-item-value">{supplier_analysis.supply_chain_risks?.disruption_probability}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">缓解措施:</span>
                <span className="datalake-audit-item-value">{supplier_analysis.supply_chain_risks?.mitigation_measures}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 客户分析 */}
      {customer_analysis && Object.keys(customer_analysis).length > 0 && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">客户分析</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">客户集中度</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">前5客户集中度:</span>
                <span className="datalake-audit-item-value">{(customer_analysis.customer_concentration?.top_5_concentration * 100).toFixed(0)}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">前10客户集中度:</span>
                <span className="datalake-audit-item-value">{(customer_analysis.customer_concentration?.top_10_concentration * 100).toFixed(0)}%</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">风险评估:</span>
                <span className="datalake-audit-item-value">{customer_analysis.customer_concentration?.risk_assessment}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">趋势:</span>
                <span className="datalake-audit-item-value">{customer_analysis.customer_concentration?.trend}</span>
              </div>
            </div>
            
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">客户满意度</h5>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">总体评分:</span>
                <span className="datalake-audit-item-value">{customer_analysis.customer_satisfaction?.overall_score}/10</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">净推荐值(NPS):</span>
                <span className="datalake-audit-item-value">{customer_analysis.customer_satisfaction?.nps}</span>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">关键优势:</span>
                <div className="datalake-audit-tags">
                  {customer_analysis.customer_satisfaction?.key_strengths?.map((strength, idx) => (
                    <span key={idx} className="datalake-audit-tag">{strength}</span>
                  ))}
                </div>
              </div>
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">改进领域:</span>
                <div className="datalake-audit-tags">
                  {customer_analysis.customer_satisfaction?.improvement_areas?.map((area, idx) => (
                    <span key={idx} className="datalake-audit-tag">{area}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {customer_analysis.customer_segmentation && (
            <div className="datalake-audit-card mt-3">
              <h5 className="datalake-audit-card-title">客户细分</h5>
              <div className="datalake-table-container">
                <table className="datalake-table">
                  <thead>
                    <tr>
                      <th>细分市场</th>
                      <th>收入贡献</th>
                      <th>利润率</th>
                      <th>增长率</th>
                      <th>流失率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer_analysis.customer_segmentation.map((segment, idx) => (
                      <tr key={idx}>
                        <td>{segment.segment}</td>
                        <td>{(segment.revenue_contribution * 100).toFixed(0)}%</td>
                        <td>{(segment.profit_margin * 100).toFixed(0)}%</td>
                        <td>{(segment.growth * 100).toFixed(0)}%</td>
                        <td>{(segment.churn_rate * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 审计分析: 关联方交易 */}
      {audit_analysis.related_party_transactions && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">关联方交易分析</h4>
          <div className="datalake-audit-card">
            <div className="datalake-table-container">
              <table className="datalake-table">
                <thead>
                  <tr>
                    <th>关联方</th>
                    <th>关系</th>
                    <th>交易量</th>
                    <th>类别占比</th>
                    <th>定价评估</th>
                  </tr>
                </thead>
                <tbody>
                  {audit_analysis.related_party_transactions.related_parties_identified?.map((party, idx) => (
                    <tr key={idx}>
                      <td>{party.name}</td>
                      <td>{party.relationship}</td>
                      <td>{party.transaction_volume.toLocaleString()}</td>
                      <td>{(party.percentage_of_category * 100).toFixed(1)}%</td>
                      <td>{party.pricing_assessment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="datalake-audit-item mt-3">
              <span className="datalake-audit-item-label">风险评估:</span>
              <span className="datalake-audit-item-value">{audit_analysis.related_party_transactions.risk_assessment}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">审计观察:</span>
              <span className="datalake-audit-item-value">{audit_analysis.related_party_transactions.audit_observations}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">审计建议:</span>
              <span className="datalake-audit-item-value">{audit_analysis.related_party_transactions.audit_recommendations}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 审计分析: 竞争实践合规性 */}
      {audit_analysis.competitive_practices_compliance && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">竞争实践合规性</h4>
          <div className="datalake-audit-card">
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">反垄断风险评估:</span>
              <span className="datalake-audit-item-value">{audit_analysis.competitive_practices_compliance.antitrust_risk_assessment}</span>
            </div>
            
            <h5 className="datalake-audit-subtitle mt-3">定价实践评估</h5>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">掠夺性定价风险:</span>
              <span className="datalake-audit-item-value">{audit_analysis.competitive_practices_compliance.pricing_practices_review?.predatory_pricing_risk}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">价格固定风险:</span>
              <span className="datalake-audit-item-value">{audit_analysis.competitive_practices_compliance.pricing_practices_review?.price_fixing_risk}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">折扣政策合规性:</span>
              <span className="datalake-audit-item-value">{audit_analysis.competitive_practices_compliance.pricing_practices_review?.discount_policy_compliance}</span>
            </div>
            
            <div className="datalake-audit-item mt-3">
              <span className="datalake-audit-item-label">审计建议:</span>
              <span className="datalake-audit-item-value">{audit_analysis.competitive_practices_compliance.audit_recommendations}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* 审计分析: 战略联盟与合资企业 */}
      {audit_analysis.strategic_alliances_and_jvs && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">战略联盟与合资企业</h4>
          <div className="datalake-audit-card">
            <h5 className="datalake-audit-subtitle">关键关系</h5>
            <div className="datalake-table-container">
              <table className="datalake-table">
                <thead>
                  <tr>
                    <th>实体</th>
                    <th>类型</th>
                    <th>目的</th>
                    <th>状态</th>
                    <th>财务敞口</th>
                    <th>治理评估</th>
                  </tr>
                </thead>
                <tbody>
                  {audit_analysis.strategic_alliances_and_jvs.key_relationships?.map((rel, idx) => (
                    <tr key={idx}>
                      <td>{rel.entity}</td>
                      <td>{rel.type}</td>
                      <td>{rel.purpose}</td>
                      <td>{rel.status}</td>
                      <td>{rel.financial_exposure}</td>
                      <td>{rel.governance_assessment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <h5 className="datalake-audit-subtitle mt-3">风险管理</h5>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">合同保护:</span>
              <span className="datalake-audit-item-value">{audit_analysis.strategic_alliances_and_jvs.risk_management?.contract_protections}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">退出机制:</span>
              <span className="datalake-audit-item-value">{audit_analysis.strategic_alliances_and_jvs.risk_management?.exit_mechanisms}</span>
            </div>
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">绩效监控:</span>
              <span className="datalake-audit-item-value">{audit_analysis.strategic_alliances_and_jvs.risk_management?.performance_monitoring}</span>
            </div>
            
            <div className="datalake-audit-item mt-3">
              <span className="datalake-audit-item-label">审计建议:</span>
              <span className="datalake-audit-item-value">{audit_analysis.strategic_alliances_and_jvs.audit_recommendations}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 辅助函数：获取风险名称的显示文本
const getRiskName = (key) => {
  const nameMap = {
    market_concentration_risk: "市场集中度风险",
    disruptive_innovation_risk: "颠覆性创新风险",
    market_expansion_risk: "市场扩张风险"
  };
  
  return nameMap[key] || key;
};

export default ExternalAuditView; 