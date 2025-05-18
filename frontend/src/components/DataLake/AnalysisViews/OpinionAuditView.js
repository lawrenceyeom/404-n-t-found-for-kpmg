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

const ScoreBadge = ({ score, maxScore = 10 }) => {
  let color = '#4be1a0';
  
  if (score < maxScore * 0.4) {
    color = '#ff5c5c';
  } else if (score < maxScore * 0.7) {
    color = '#ffd666';
  }
  
  return (
    <span className="datalake-score-badge" style={{ backgroundColor: color }}>
      {score.toFixed(1)}
    </span>
  );
};

const OpinionAuditView = ({ data }) => {
  if (!data || !data.audit_analysis) {
    return <div className="datalake-no-data">未找到舆情审计分析数据</div>;
  }
  
  // 检查必要的数据结构是否存在
  const hasSentimentSummary = data.sentiment_summary && typeof data.sentiment_summary === 'object';
  const hasMediaExposure = data.media_exposure && typeof data.media_exposure === 'object';
  const hasDisclosureCompliance = data.audit_analysis.disclosure_compliance && typeof data.audit_analysis.disclosure_compliance === 'object';
  const hasLitigationRiskAssessment = data.audit_analysis.litigation_risk_assessment && typeof data.audit_analysis.litigation_risk_assessment === 'object';
  
  const { audit_analysis, sentiment_summary, media_exposure } = data;
  
  return (
    <div className="datalake-audit-view">
      <h3 className="datalake-block-title">舆情审计分析</h3>
      
      {/* 舆情情感分析摘要 */}
      {hasSentimentSummary && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">舆情情感分析</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <div className="datalake-audit-sentiment-header">
                <h5 className="datalake-audit-card-title">情感评分</h5>
                <div className="datalake-sentiment-score-container">
                  <ScoreBadge score={sentiment_summary.overall_score} />
                  <span className="datalake-sentiment-trend">
                    {sentiment_summary.trending === 'improving' ? '↗️ 上升' : 
                     sentiment_summary.trending === 'declining' ? '↘️ 下降' : '→ 平稳'}
                  </span>
                </div>
              </div>
              
              <div className="datalake-audit-sentiment-metrics">
                <div className="datalake-sentiment-metric">
                  <span className="datalake-audit-label">正面情感率:</span>
                  <span className="datalake-sentiment-value" style={{ color: '#52c41a' }}>
                    {(sentiment_summary.positive_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="datalake-sentiment-metric">
                  <span className="datalake-audit-label">中性情感率:</span>
                  <span className="datalake-sentiment-value" style={{ color: '#1890ff' }}>
                    {(sentiment_summary.neutral_rate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="datalake-sentiment-metric">
                  <span className="datalake-audit-label">负面情感率:</span>
                  <span className="datalake-sentiment-value" style={{ color: '#f5222d' }}>
                    {(sentiment_summary.negative_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">对比历史:</span>
                <span>{sentiment_summary.historical_comparison}</span>
              </div>
              
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">行业位置:</span>
                <span>{sentiment_summary.industry_position}</span>
              </div>
            </div>
            
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">主要话题分析</h5>
              
              {sentiment_summary.key_positive_topics && Array.isArray(sentiment_summary.key_positive_topics) && (
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">正面关键话题:</span>
                  <div className="datalake-audit-tags">
                    {sentiment_summary.key_positive_topics.map((topic, idx) => (
                      <span key={idx} className="datalake-audit-tag" style={{backgroundColor: '#f6ffed', color: '#52c41a'}}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {sentiment_summary.key_negative_topics && Array.isArray(sentiment_summary.key_negative_topics) && (
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">负面关键话题:</span>
                  <div className="datalake-audit-tags">
                    {sentiment_summary.key_negative_topics.map((topic, idx) => (
                      <span key={idx} className="datalake-audit-tag" style={{backgroundColor: '#fff1f0', color: '#f5222d'}}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 媒体曝光分析 */}
      {hasMediaExposure && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">媒体曝光分析</h4>
          <div className="datalake-audit-grid-2col">
            <div className="datalake-audit-card">
              <h5 className="datalake-audit-card-title">媒体曝光概览</h5>
              
              <div className="datalake-audit-media-metrics">
                <div className="datalake-media-metric">
                  <span className="datalake-audit-label">总提及次数:</span>
                  <span className="datalake-media-value">{media_exposure.total_mentions.toLocaleString()}</span>
                  <span className="datalake-media-trend">
                    {media_exposure.mentions_trend}
                  </span>
                </div>
                
                <div className="datalake-media-metric">
                  <span className="datalake-audit-label">总覆盖人数:</span>
                  <span className="datalake-media-value">{media_exposure.total_reach.toLocaleString()}</span>
                  <span className="datalake-media-trend">
                    {media_exposure.reach_trend}
                  </span>
                </div>
              </div>
              
              {media_exposure.daily_mentions && Array.isArray(media_exposure.daily_mentions) && (
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">每日提及量:</span>
                  <div className="datalake-daily-mentions">
                    {media_exposure.daily_mentions.map((count, idx) => (
                      <div key={idx} className="datalake-mention-bar" 
                        style={{ 
                          height: `${count / Math.max(...media_exposure.daily_mentions) * 100}%`,
                          backgroundColor: count > Math.max(...media_exposure.daily_mentions) * 0.8 ? '#ff7875' : '#1890ff'
                        }} 
                        title={`${idx + 1}日: ${count}次提及`}>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {media_exposure.platform_distribution && Array.isArray(media_exposure.platform_distribution) && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">平台分布</h5>
                
                <div className="datalake-platform-distribution">
                  {media_exposure.platform_distribution.map((platform, idx) => (
                    <div key={idx} className="datalake-platform-item">
                      <div className="datalake-platform-name">{platform.platform}</div>
                      <div className="datalake-platform-bar-container">
                        <div className="datalake-platform-bar" 
                          style={{ 
                            width: `${platform.percentage * 100}%`,
                            backgroundColor: idx % 2 === 0 ? '#1890ff' : '#13c2c2'
                          }}>
                        </div>
                        <span className="datalake-platform-percentage">
                          {(platform.percentage * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 信息披露合规性 */}
      {hasDisclosureCompliance && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">信息披露合规性</h4>
          <div className="datalake-audit-card">
            <div className="datalake-audit-header">
              <span className="datalake-audit-label">评估结果:</span>
              <span className="datalake-audit-value">{audit_analysis.disclosure_compliance.assessment}</span>
            </div>
            
            {audit_analysis.disclosure_compliance.key_findings && Array.isArray(audit_analysis.disclosure_compliance.key_findings) && (
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">关键发现:</span>
                <ul className="datalake-audit-list">
                  {audit_analysis.disclosure_compliance.key_findings.map((finding, idx) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {audit_analysis.disclosure_compliance.improvement_areas && Array.isArray(audit_analysis.disclosure_compliance.improvement_areas) && (
              <div className="datalake-audit-item">
                <span className="datalake-audit-item-label">改进领域:</span>
                <ul className="datalake-audit-list">
                  {audit_analysis.disclosure_compliance.improvement_areas.map((area, idx) => (
                    <li key={idx}>{area}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="datalake-audit-item">
              <span className="datalake-audit-item-label">建议:</span>
              <p>{audit_analysis.disclosure_compliance.recommendation}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 诉讼风险评估 */}
      {hasLitigationRiskAssessment && (
        <div className="datalake-audit-section">
          <h4 className="datalake-audit-section-title">诉讼风险评估</h4>
          <div className="datalake-audit-grid-2col">
            {audit_analysis.litigation_risk_assessment.current_litigation && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">当前诉讼情况</h5>
                
                <div className="datalake-litigation-metrics">
                  <div className="datalake-litigation-metric">
                    <span className="datalake-audit-label">诉讼数量:</span>
                    <span className="datalake-litigation-value">{audit_analysis.litigation_risk_assessment.current_litigation.count}</span>
                  </div>
                  
                  <div className="datalake-litigation-metric">
                    <span className="datalake-audit-label">潜在影响:</span>
                    <span className="datalake-litigation-value">{audit_analysis.litigation_risk_assessment.current_litigation.potential_impact}</span>
                  </div>
                  
                  <div className="datalake-litigation-metric">
                    <span className="datalake-audit-label">重大案件:</span>
                    <span className="datalake-litigation-value">{audit_analysis.litigation_risk_assessment.current_litigation.material_cases}</span>
                  </div>
                  
                  <div className="datalake-litigation-metric">
                    <span className="datalake-audit-label">准备金充足性:</span>
                    <span className="datalake-litigation-value">{audit_analysis.litigation_risk_assessment.current_litigation.provisions_adequacy}</span>
                  </div>
                </div>
              </div>
            )}
            
            {audit_analysis.litigation_risk_assessment.future_risks && (
              <div className="datalake-audit-card">
                <h5 className="datalake-audit-card-title">未来诉讼风险</h5>
                
                <div className="datalake-audit-risk-header">
                  <span className="datalake-audit-label">整体风险水平:</span>
                  <RiskLevelBadge level={audit_analysis.litigation_risk_assessment.future_risks.overall_risk_level} />
                </div>
                
                {audit_analysis.litigation_risk_assessment.future_risks.risk_factors && 
                 Array.isArray(audit_analysis.litigation_risk_assessment.future_risks.risk_factors) && (
                  <div className="datalake-audit-item">
                    <span className="datalake-audit-item-label">风险因素:</span>
                    <ul className="datalake-audit-list">
                      {audit_analysis.litigation_risk_assessment.future_risks.risk_factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="datalake-audit-item">
                  <span className="datalake-audit-item-label">风险缓解建议:</span>
                  <p>{audit_analysis.litigation_risk_assessment.future_risks.mitigation_recommendations}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* 声誉风险 */}
      <div className="datalake-audit-section">
        <h4 className="datalake-audit-section-title">声誉风险评估</h4>
        <div className="datalake-audit-card">
          <div className="datalake-audit-header">
            <span className="datalake-audit-label">总体评估:</span>
            <span className="datalake-audit-value">{audit_analysis.reputation_risk.overall_assessment}</span>
          </div>
          
          <div className="datalake-audit-item">
            <span className="datalake-audit-item-label">品牌认知:</span>
            <div>
              <div><strong>强度:</strong> {audit_analysis.reputation_risk.brand_perception.strength}</div>
              <div><strong>稳定性:</strong> {audit_analysis.reputation_risk.brand_perception.stability}</div>
              <div><strong>薄弱环节:</strong> 
                <ul className="datalake-audit-list">
                  {audit_analysis.reputation_risk.brand_perception.vulnerabilities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="datalake-audit-item">
            <span className="datalake-audit-item-label">行业对比:</span>
            <span>{audit_analysis.reputation_risk.industry_comparison}</span>
          </div>
          
          <div className="datalake-audit-item">
            <span className="datalake-audit-item-label">关键声誉驱动因素:</span>
            <ul className="datalake-audit-list">
              {audit_analysis.reputation_risk.key_reputation_drivers.map((driver, idx) => (
                <li key={idx}>{driver}</li>
              ))}
            </ul>
          </div>
          
          <div className="datalake-audit-recommendation">
            <span className="datalake-audit-label">建议:</span>
            <span>{audit_analysis.reputation_risk.recommendation}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpinionAuditView; 