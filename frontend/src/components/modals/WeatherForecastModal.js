import React from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherSVG from '../common/WeatherSVG';

const WeatherForecastModal = ({ isOpen, onClose, weather, company, analysisData }) => {
  const navigate = useNavigate();

  if (!isOpen || !weather) return null;

  const handleViewDataLake = () => {
    // The 'company' prop from App.js is already the lowercase ID (e.g., 'aura', 'beta', 'crisis')
    // The DataLake component uses these query parameters to select the correct data and view.
    navigate(`/datalake?company=${company.toLowerCase()}&data_type=finance&layer=analysis`);
    onClose();
  };

  // Extract key information from analysis data
  const financialRatios = analysisData?.financial_ratios || {};
  const auditAnalysis = analysisData?.audit_analysis || {};
  const goingConcern = auditAnalysis?.going_concern || {};
  const keyRiskAreas = auditAnalysis?.key_risk_areas || [];

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      top: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: 'rgba(10,31,68,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#162447',
        borderRadius: 16,
        padding: '28px 32px 18px 32px',
        minWidth: 420,
        maxWidth: 680,
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 4px 32px #00152955',
        border: `2.5px solid ${weather.color}`,
        color: '#eaf6ff',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <div style={{
            minWidth: 42,
            minHeight: 42,
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: weather.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: '#fff',
            marginRight: 16,
            boxShadow: `0 0 12px ${weather.color}55`
          }}>
            <WeatherSVG type={weather.type} animate={true} />
          </div>
          <h3 style={{ color: weather.color, fontWeight: 800, fontSize: 24, margin: 0 }}>
            气象预报 - {weather.label}
          </h3>
        </div>

        <div style={{
          background: `rgba(14, 22, 40, 0.5)`,
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          border: `1px solid ${weather.color}55`
        }}>
          <div style={{ color: '#ffd666', fontWeight: 700, marginBottom: 8 }}>
            风险态势: <span style={{ color: '#eaf6ff', fontWeight: 500 }}>{weather.explain}</span>
          </div>
          <div style={{ color: '#4be1a0', fontWeight: 700, marginBottom: 8 }}>
            审计建议: <span style={{ color: '#eaf6ff', fontWeight: 500 }}>{weather.advice}</span>
          </div>
        </div>

        {/* 基于分析数据的详细信息 */}
        <div style={{ marginTop: 20 }}>
          <h4 style={{ color: '#b3cfff', fontWeight: 700, margin: '0 0 12px 0' }}>财务审计分析摘要</h4>

          {/* 持续经营状况 */}
          {goingConcern && goingConcern.status && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ color: '#4be1a0', fontWeight: 700, fontSize: 15, margin: '0 0 8px 0' }}>持续经营评估</h5>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(14, 22, 40, 0.5)',
                borderRadius: 6,
                fontSize: 14
              }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: '#b3cfff', fontWeight: 600 }}>状态: </span>
                  <span>{goingConcern.status}</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ color: '#b3cfff', fontWeight: 600 }}>流动性评估: </span>
                  <span>{goingConcern.liquidity_assessment}</span>
                </div>
                <div>
                  <span style={{ color: '#b3cfff', fontWeight: 600 }}>分析: </span>
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>{goingConcern.analysis}</span>
                </div>
              </div>
            </div>
          )}

          {/* 关键风险区域 */}
          {keyRiskAreas && keyRiskAreas.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ color: '#ffd666', fontWeight: 700, fontSize: 15, margin: '0 0 8px 0' }}>关键风险区域</h5>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {keyRiskAreas.slice(0, 2).map((risk, index) => (
                  <div key={index} style={{
                    padding: '10px 14px',
                    background: 'rgba(14, 22, 40, 0.5)',
                    borderRadius: 6,
                    fontSize: 14
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6
                    }}>
                      <span style={{ fontWeight: 700, color: '#eaf6ff' }}>{risk.area}</span>
                      <span style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: risk.risk_level === '高' ? '#ff5c5c' :
                                    risk.risk_level === '中等' ? '#ffd666' : '#4be1a0',
                        color: '#0e1628',
                        fontWeight: 600
                      }}>
                        {risk.risk_level}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4 }}>
                      {risk.description}
                    </div>
                  </div>
                ))}
                {keyRiskAreas.length > 2 && (
                  <div style={{ fontSize: 13, color: '#b3cfff', textAlign: 'center' }}>
                    还有 {keyRiskAreas.length - 2} 个风险区域...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 关键财务比率摘要 */}
          {financialRatios && Object.keys(financialRatios).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ color: '#40a9ff', fontWeight: 700, fontSize: 15, margin: '0 0 8px 0' }}>关键财务比率</h5>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8
              }}>
                {financialRatios.profitability && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(14, 22, 40, 0.5)',
                    borderRadius: 6,
                    fontSize: 14
                  }}>
                    <div style={{ fontWeight: 600, color: '#b3cfff', marginBottom: 4 }}>盈利能力</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>净利率</span>
                      <span style={{ fontWeight: 600 }}>
                        {financialRatios.profitability.net_profit_margin
                          ? (financialRatios.profitability.net_profit_margin * 100).toFixed(1) + '%'
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}

                {financialRatios.liquidity && (
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(14, 22, 40, 0.5)',
                    borderRadius: 6,
                    fontSize: 14
                  }}>
                    <div style={{ fontWeight: 600, color: '#b3cfff', marginBottom: 4 }}>流动性</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>流动比率</span>
                      <span style={{ fontWeight: 600 }}>
                        {financialRatios.liquidity.current_ratio
                          ? financialRatios.liquidity.current_ratio.toFixed(2)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button
            onClick={handleViewDataLake}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: 'none',
              background: weather.color,
              color: '#0e1628',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>查看详细分析</span>
            <span style={{ fontSize: 18 }}>→</span>
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '7px 22px',
              borderRadius: 8,
              border: '1.5px solid #223366',
              background: '#223366',
              color: '#b3cfff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#b3cfff',
            fontSize: 22,
            cursor: 'pointer'
          }}
          title="关闭"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default WeatherForecastModal;