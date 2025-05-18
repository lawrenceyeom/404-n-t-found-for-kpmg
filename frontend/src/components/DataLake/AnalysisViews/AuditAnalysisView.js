import React, { useState, useEffect } from 'react';
import FinanceAuditView from './FinanceAuditView';
import OperationAuditView from './OperationAuditView';
import OpinionAuditView from './OpinionAuditView';
import MacroAuditView from './MacroAuditView';
import ExternalAuditView from './ExternalAuditView';
import '../DataLake.css';

/**
 * 审计分析视图组件 - 根据数据类型渲染相应的审计分析视图
 * 
 * @param {Object} props
 * @param {Object} props.data - 审计分析数据
 * @param {string} props.dataType - 数据类型 (finance, operation, opinion, macro, external)
 */
const AuditAnalysisView = ({ data, dataType }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 在组件挂载或dataType/data变化时重置状态
    setIsReady(false);
    setError(null);
    
    if (!data) {
      setError("未找到审计分析数据");
      return;
    }
    
    // 添加延迟以确保数据准备完毕
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [data, dataType]);
  
  if (error) {
    return <div className="datalake-no-data">{error}</div>;
  }
  
  if (!isReady) {
    return <div className="datalake-loading">数据加载中...</div>;
  }
  
  // 确保数据格式正确
  const isValidData = data && typeof data === 'object';
  if (!isValidData) {
    return <div className="datalake-no-data">数据格式不正确</div>;
  }
  
  // 根据数据类型渲染对应的审计视图
  try {
    switch (dataType) {
      case 'finance':
        return <FinanceAuditView data={data} />;
      case 'operation':
        return <OperationAuditView data={data} />;
      case 'opinion':
        return <OpinionAuditView data={data} />;
      case 'macro':
        return <MacroAuditView data={data} />;
      case 'external':
        return <ExternalAuditView data={data} />;
      default:
        return (
          <div className="datalake-no-data">
            未知的数据类型: {dataType}
          </div>
        );
    }
  } catch (e) {
    console.error("渲染审计视图时出错:", e);
    return (
      <div className="datalake-error">
        渲染{dataType}审计视图时出错: {e.message}
      </div>
    );
  }
};

export default AuditAnalysisView; 