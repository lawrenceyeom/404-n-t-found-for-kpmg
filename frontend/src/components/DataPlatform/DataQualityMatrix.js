import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { API_BASE } from '../../constants';
import { useDataUpdateHighlight } from '../../hooks/useDataUpdateHighlight';
import '../../styles/DataUpdateHighlight.css';
import '../../styles/DataQualityMatrix.css';

/**
 * DataQualityMatrix - 展示数据质量信息的矩阵组件
 * 
 * @param {Object} props
 * @param {Array} props.dataQuality - 来自API的数据质量信息
 */
const DataQualityMatrix = ({ dataQuality }) => {
  // ========== 状态定义 ==========
  // 数据状态
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const componentMounted = useRef(true);
  const [showResetHint, setShowResetHint] = useState(false);
  
  // 使用ref存储重置数据函数，避免依赖问题
  const resetDataRef = useRef(null);
  
  // UI状态
  const [sortConfig, setSortConfig] = useState({ key: 'sourceName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [animatedCell, setAnimatedCell] = useState(null);
  const [refreshingCells, setRefreshingCells] = useState(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 指标键名和对应的中文名称
  const metricKeys = ['completeness', 'accuracy', 'consistency', 'timeliness', 'validity'];
  const metricNames = {
    'completeness': '完整性',
    'accuracy': '准确性',
    'consistency': '一致性',
    'timeliness': '时效性',
    'validity': '有效性'
  };
  
  // 指标描述
  const metricDescriptions = {
    'completeness': '数据字段的填充完整程度，没有缺失值',
    'accuracy': '数据值与实际值的接近程度',
    'consistency': '数据在不同系统中的一致程度',
    'timeliness': '数据更新的及时性',
    'validity': '数据符合业务规则和格式要求的程度'
  };
  
  // 高亮效果
  const highlight = useDataUpdateHighlight(dataQuality);
  
  // 一次性生成随机趋势数据 (只在组件初始化时生成，不随渲染变化)
  const trendData = useRef(new Map());
  
  // ========== 数据处理 ==========
  
  // 计算总页数
  const totalPages = useMemo(() => 
    Math.ceil(data.length / rowsPerPage), 
    [data.length, rowsPerPage]
  );
  
  // 完全重置数据
  const handleResetData = useCallback(() => {
    console.log('[handleResetData] Attempting to reset data...');
    setLoading(true);
    sessionStorage.removeItem('dataQualityMatrixData');
    // setShowResetHint(false); // We'll manage this more carefully

    setTimeout(() => {
      try {
        console.log('[handleResetData] Generating mock data...');
        const freshData = generateMockData();

        if (freshData && freshData.length > 0) {
          setData(freshData);
          setError(null); // Clear previous errors
          setShowResetHint(false); // Data loaded successfully, hide hint
          console.log('[handleResetData] Mock data generated and set, items:', freshData.length);
        } else {
          console.warn('[handleResetData] generateMockData returned empty or null.');
          setData([]); // Ensure data is empty
          setError('无法加载模拟数据，数据为空。'); // Set an error message
          setShowResetHint(true); // Show hint because mock data is problematic
        }
        setLastUpdated(Date.now());
        trendData.current = new Map(); // 重置趋势数据
        setCurrentPage(1); // 回到第一页
      } catch (err) {
        console.error('[handleResetData] Error during mock data generation/setting state:', err);
        setData([]);
        setError('生成数据时发生内部错误。');
        setShowResetHint(true); // Show hint on error
      } finally {
        setLoading(false);
        console.log('[handleResetData] Reset process finished.');
      }
    }, 1000);
  }, []); // Dependencies like setError, setShowResetHint, etc., are stable from useState.
  
  // 存储重置函数到ref中，以便在useEffect中使用而不产生依赖循环
  useEffect(() => {
    resetDataRef.current = handleResetData;
  }, [handleResetData]);
  
  // 加载数据 - 优先使用props，然后使用mock数据，修复数据加载问题
  useEffect(() => {
    console.log('[Effect: Initial Load/Props] Running. dataQuality provided:', !!(dataQuality && dataQuality.length > 0));
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. 如果有props数据，使用props
        if (dataQuality && dataQuality.length > 0) {
          console.log('Using data from props:', dataQuality.length, 'items');
          setData(dataQuality);
          // 不再保存到sessionStorage，避免缓存问题
          setLastUpdated(Date.now());
          setLoading(false);
          return;
        }
        
        // 2. 不再依赖sessionStorage，直接加载mock数据
        console.log('Loading mock data');
        // 这里模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const mockData = generateMockData();
        setData(mockData);
        setLastUpdated(Date.now());
      } catch (err) {
        console.error('Error loading data:', err);
        setError('加载数据时出错，请刷新页面重试');
        setShowResetHint(true);
      } finally {
        setLoading(false);
      }
    };
    
    // 每次组件挂载时清除sessionStorage中的数据，确保使用最新数据
    sessionStorage.removeItem('dataQualityMatrixData');
    
    // 直接使用重置数据功能，确保每次进入页面都使用新的数据
    if (dataQuality && dataQuality.length > 0) {
      // 如果有props数据，用loadData加载
      loadData();
    } else {
      // 否则使用重置数据功能加载新的mock数据
      console.log('[Effect: Initial Load/Props] No props, calling resetDataRef.current.');
      resetDataRef.current?.();
    }
  }, [dataQuality]);
  
  // 保存UI偏好到sessionStorage
  useEffect(() => {
    if (loading) return;
    
    sessionStorage.setItem('dataQualityMatrixSortKey', sortConfig.key);
    sessionStorage.setItem('dataQualityMatrixSortDirection', sortConfig.direction);
    sessionStorage.setItem('dataQualityMatrixCurrentPage', String(currentPage));
    sessionStorage.setItem('dataQualityMatrixRowsPerPage', String(rowsPerPage));
  }, [sortConfig, currentPage, rowsPerPage, loading]);
  
  // 恢复UI偏好
  useEffect(() => {
    const sortKey = sessionStorage.getItem('dataQualityMatrixSortKey');
    const sortDirection = sessionStorage.getItem('dataQualityMatrixSortDirection');
    const savedPage = sessionStorage.getItem('dataQualityMatrixCurrentPage');
    const savedRowsPerPage = sessionStorage.getItem('dataQualityMatrixRowsPerPage');
    
    if (sortKey) {
      setSortConfig(prev => ({ ...prev, key: sortKey }));
    }
    
    if (sortDirection) {
      setSortConfig(prev => ({ ...prev, direction: sortDirection }));
    }
    
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
    
    if (savedRowsPerPage) {
      setRowsPerPage(parseInt(savedRowsPerPage, 10));
    }
  }, []);
  
  // 生成随机趋势数据 (基于数据源ID)
  useEffect(() => {
    if (data.length === 0) return;
    
    data.forEach(source => {
      if (!trendData.current.has(source.id)) {
        const sourceTrends = {};
        metricKeys.forEach(metric => {
          // 生成-10%到+10%之间的随机趋势
          sourceTrends[metric] = (Math.random() * 0.2 - 0.1);
        });
        trendData.current.set(source.id, sourceTrends);
      }
    });
  }, [data, metricKeys]);

  // 设置自动刷新
  useEffect(() => {
    if (data.length === 0 || loading) return;
    
    const refreshInterval = setInterval(() => {
      handleAutoRefresh();
    }, 15000); // 每15秒自动刷新
    
    return () => clearInterval(refreshInterval);
  }, [data, loading]);
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 组件卸载时清除sessionStorage中的数据，确保下次进入时重新加载
      sessionStorage.removeItem('dataQualityMatrixData');
      componentMounted.current = false;
    }
  }, []);
  
  // 监听路由变化的自定义钩子
  useEffect(() => {
    // 页面可见性变化处理函数 (获取当前状态)
    const isCurrentlyVisible = () => document.visibilityState === 'visible';

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        if (componentMounted.current && isCurrentlyVisible()) {
          console.log('[MutationObserver] DOM changed, component visible, refreshing data...');
          resetDataRef.current?.();
        }
      });
    });

    const titleElement = document.querySelector('title');
    if (titleElement) {
      observer.observe(titleElement, {
        subtree: true,
        characterData: true,
        childList: true
      });
    } else {
      console.warn('DataQualityMatrix: <title> element not found for MutationObserver.');
    }

    const handlePopState = () => {
      if (componentMounted.current && isCurrentlyVisible()) {
        console.log('[PopState] History state changed, component visible, refreshing data...');
        resetDataRef.current?.();
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Log when this effect sets up
    console.log('[Effect Setup] MutationObserver and PopState listeners attached.');

    return () => {
      console.log('[Effect Cleanup] Disconnecting MutationObserver and PopState listeners.');
      observer.disconnect();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Dependency array is now empty
  
  // 添加页面可见性变化监听器，当页面变为可见时重新加载数据
  useEffect(() => {
    console.log('[Effect Setup] Visibility and Focus listeners attaching.');
    // 页面可见性变化处理函数
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setIsVisible(true);
        // 当页面变为可见时，强制刷新数据
        if (componentMounted.current) {
          console.log('[VisibilityChange] Page became visible, refreshing data...');
          resetDataRef.current?.();
        }
      } else {
        setIsVisible(false);
      }
    };
    
    // 窗口聚焦事件处理函数
    const handleWindowFocus = () => {
      if (componentMounted.current) {
        console.log('[WindowFocus] Window focused, refreshing data...');
        setIsVisible(true);
        resetDataRef.current?.();
      }
    };
    
    // 添加监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    // 清理函数
    return () => {
      console.log('[Effect Cleanup] Visibility and Focus listeners detaching.');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);
  
  // 路由变化监听器 - 监听组件挂载后的URL变化事件
  useEffect(() => {
    console.log('[Effect Setup] URL polling listener attaching.');
    let lastPathname = window.location.pathname;
    
    // URL变化检查函数
    const checkURLChange = () => {
      const currentPathname = window.location.pathname;
      
      // 如果路径变化了，但是现在又回到了本页面，刷新数据
      if (lastPathname !== currentPathname) {
        console.log('[URL Poll] URL changed from', lastPathname, 'to', currentPathname);
        
        if (currentPathname.includes('DataPlatform')) {
          console.log('[URL Poll] Returned to DataPlatform, refreshing data...');
          resetDataRef.current?.();
        }
        
        lastPathname = currentPathname;
      }
    };
    
    // 创建一个定时器，定期检查URL是否变化
    const intervalId = setInterval(checkURLChange, 500);
    
    return () => {
      console.log('[Effect Cleanup] URL polling listener detaching.');
      clearInterval(intervalId);
    };
  }, []);
  
  // ========== 功能函数 ==========
  
  // 处理排序
  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // 如果点击的是当前排序列，则切换排序方向
        return { 
          key, 
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' 
        };
      }
      // 否则，使用新的列并默认为升序
      return { key, direction: 'asc' };
    });
    
    // 排序时回到第一页
    setCurrentPage(1);
  }, []);
  
  // 获取排序后的数据
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // 创建新的数组来排序，避免修改原始数据
    return [...data].sort((a, b) => {
      let valueA, valueB;
      
      // 根据不同类型的列获取相应的值
      if (sortConfig.key === 'sourceName') {
        valueA = a.sourceName || '';
        valueB = b.sourceName || '';
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (sortConfig.key === 'sourceType') {
        valueA = a.sourceType || '';
        valueB = b.sourceType || '';
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (sortConfig.key === 'lastUpdated') {
        valueA = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
        valueB = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
      } else if (sortConfig.key === 'overall') {
        valueA = a.overall || 0;
        valueB = b.overall || 0;
      } else if (metricKeys.includes(sortConfig.key)) {
        // 处理指标列
        valueA = (a.metrics && a.metrics[sortConfig.key] !== undefined) 
          ? a.metrics[sortConfig.key] 
          : 0;
        valueB = (b.metrics && b.metrics[sortConfig.key] !== undefined) 
          ? b.metrics[sortConfig.key] 
          : 0;
      } else {
        // 默认情况，使用ID排序
        valueA = a.id || '';
        valueB = b.id || '';
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      // 对数值和日期类型进行排序
      if (valueA instanceof Date && valueB instanceof Date) {
        return sortConfig.direction === 'asc' 
          ? valueA - valueB
          : valueB - valueA;
      }
      
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortConfig.direction === 'asc' 
          ? valueA - valueB
          : valueB - valueA;
      }
      
      // 默认字符串比较
      return sortConfig.direction === 'asc' 
        ? String(valueA).localeCompare(String(valueB))
        : String(valueB).localeCompare(String(valueA));
    });
  }, [data, sortConfig, metricKeys]);
  
  // 获取当前页的数据
  const paginatedData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // 确保页码不超出范围
    if (startIndex >= sortedData.length) {
      setCurrentPage(1);
      return sortedData.slice(0, rowsPerPage);
    }
    
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);
  
  // 处理页码变化
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);
  
  // 获取评分颜色类
  const getScoreColorClass = useCallback((score) => {
    if (score >= 0.8) return 'high-score';
    if (score >= 0.6) return 'medium-score';
    return 'low-score';
  }, []);
  
  // 处理单元格点击（涟漪效果）
  const handleCellClick = useCallback((e, rowIndex, metric) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setAnimatedCell({ 
      active: true, 
      x, 
      y, 
      rowIndex, 
      metric
    });
    
    // 600ms后重置动画状态
    setTimeout(() => {
      setAnimatedCell(null);
    }, 600);
  }, []);
  
  // 处理单元格鼠标悬停
  const handleCellHover = useCallback((e, rowIndex, metric) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    setHoveredCell({
      rowIndex,
      metric,
      x: e.clientX,
      y: e.clientY,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    });
  }, []);
  
  // 处理自动刷新
  const handleAutoRefresh = useCallback(() => {
    if (data.length === 0 || isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('Auto refreshing data...');
    
    // 随机选择2-4个数据源更新
    const sourceCount = Math.floor(Math.random() * 3) + 2;
    const newRefreshingCells = new Set();
    const updatedData = [...data];
    
    // 随机选择要更新的数据源索引
    const sourceIndices = new Set();
    while (sourceIndices.size < sourceCount && sourceIndices.size < data.length) {
      const randomIndex = Math.floor(Math.random() * data.length);
      sourceIndices.add(randomIndex);
    }
    
    // 对每个选中的数据源更新2-3个随机指标
    sourceIndices.forEach(sourceIndex => {
      const source = updatedData[sourceIndex];
      if (!source || !source.metrics) return;
      
      // 随机选择要更新的指标
      const metricsCount = Math.floor(Math.random() * 2) + 2;
      const metricsToUpdate = new Set();
      
      while (metricsToUpdate.size < metricsCount && metricsToUpdate.size < metricKeys.length) {
        const randomMetricIndex = Math.floor(Math.random() * metricKeys.length);
        metricsToUpdate.add(metricKeys[randomMetricIndex]);
      }
      
      // 更新选中的指标
      let totalScore = 0;
      let totalCount = 0;
      
      metricsToUpdate.forEach(metric => {
        if (!source.metrics[metric] && source.metrics[metric] !== 0) return;
        
        // 随机变化范围 -0.1 到 +0.1
        const change = (Math.random() * 0.2) - 0.1;
        const currentValue = source.metrics[metric];
        // 确保值在0-1范围内
        const newValue = Math.max(0, Math.min(1, currentValue + change));
        
        source.metrics[metric] = newValue;
        totalScore += newValue;
        totalCount++;
        
        // 添加到刷新单元格集合中
        newRefreshingCells.add(`${source.id}-${metric}`);
      });
      
      // 更新总体评分
      if (totalCount > 0) {
        source.overall = totalScore / totalCount;
      }
      
      // 更新时间
      source.lastUpdated = new Date().toISOString();
    });
    
    setData(updatedData);
    setRefreshingCells(newRefreshingCells);
    setLastUpdated(Date.now());
    
    // 3秒后重置刷新状态
    setTimeout(() => {
      setRefreshingCells(new Set());
      setIsRefreshing(false);
    }, 3000);
  }, [data, isRefreshing, metricKeys]);
  
  // 手动刷新数据
  const handleManualRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('Manual refreshing data...');
    
    // 更新所有数据源的所有指标
    const newRefreshingCells = new Set();
    const updatedData = [...data];
    
    updatedData.forEach(source => {
      if (!source || !source.metrics) return;
      
      let totalScore = 0;
      let totalMetricCount = 0;
      
      metricKeys.forEach(metric => {
        if (!source.metrics[metric] && source.metrics[metric] !== 0) return;
        
        // 随机变化范围 -0.05 到 +0.05 (变化较小)
        const change = (Math.random() * 0.1) - 0.05;
        const currentValue = source.metrics[metric];
        // 确保值在0-1范围内
        const newValue = Math.max(0, Math.min(1, currentValue + change));
        
        source.metrics[metric] = newValue;
        totalScore += newValue;
        totalMetricCount++;
        
        // 添加到刷新单元格集合中
        newRefreshingCells.add(`${source.id}-${metric}`);
      });
      
      // 更新总体评分
      if (totalMetricCount > 0) {
        source.overall = totalScore / totalMetricCount;
      }
      
      // 更新时间
      source.lastUpdated = new Date().toISOString();
    });
    
    setData(updatedData);
    setRefreshingCells(newRefreshingCells);
    setLastUpdated(Date.now());
    
    // 3秒后重置刷新状态
    setTimeout(() => {
      setRefreshingCells(new Set());
      setIsRefreshing(false);
    }, 3000);
  }, [data, isRefreshing, metricKeys]);
  
  // 创建生成mock数据的函数
  const generateMockData = () => {
    // 生成当前日期
    const now = new Date();
    const today = now.toISOString();
    
    // 生成随机评分的辅助函数
    const getRandomScore = (min, max) => {
      return Math.round((Math.random() * (max - min) + min) * 100) / 100;
    };
    
    // 生成随机时间（过去24小时内）
    const getRandomTime = () => {
      const randomMinutes = Math.floor(Math.random() * 24 * 60);
      const date = new Date(now);
      date.setMinutes(date.getMinutes() - randomMinutes);
      return date.toISOString();
    };
    
    return [
      {
        id: '1',
        sourceName: 'AURA稳健',
        sourceType: '企业内部系统',
        metrics: {
          completeness: getRandomScore(0.85, 0.95),
          accuracy: getRandomScore(0.82, 0.92),
          consistency: getRandomScore(0.80, 0.90),
          timeliness: getRandomScore(0.88, 0.98),
          validity: getRandomScore(0.85, 0.95)
        },
        overall: 0,  // 将在下面计算
        lastUpdated: getRandomTime()
      },
      {
        id: '2',
        sourceName: 'BETA成长',
        sourceType: '企业内部系统',
        metrics: {
          completeness: getRandomScore(0.80, 0.90),
          accuracy: getRandomScore(0.78, 0.88),
          consistency: getRandomScore(0.75, 0.85),
          timeliness: getRandomScore(0.82, 0.92),
          validity: getRandomScore(0.78, 0.88)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '3',
        sourceName: 'CRISIS压力',
        sourceType: '企业内部系统',
        metrics: {
          completeness: getRandomScore(0.68, 0.78),
          accuracy: getRandomScore(0.65, 0.75),
          consistency: getRandomScore(0.62, 0.72),
          timeliness: getRandomScore(0.75, 0.85),
          validity: getRandomScore(0.68, 0.78)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '4',
        sourceName: 'Wind金融终端',
        sourceType: '金融数据库',
        metrics: {
          completeness: getRandomScore(0.95, 0.99),
          accuracy: getRandomScore(0.92, 0.98),
          consistency: getRandomScore(0.93, 0.99),
          timeliness: getRandomScore(0.97, 0.99),
          validity: getRandomScore(0.94, 0.99)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '5',
        sourceName: 'Bloomberg数据库',
        sourceType: '金融数据库',
        metrics: {
          completeness: getRandomScore(0.94, 0.99),
          accuracy: getRandomScore(0.93, 0.98),
          consistency: getRandomScore(0.92, 0.97),
          timeliness: getRandomScore(0.95, 0.99),
          validity: getRandomScore(0.93, 0.98)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '6',
        sourceName: '国家统计局API',
        sourceType: '公共数据源',
        metrics: {
          completeness: getRandomScore(0.80, 0.90),
          accuracy: getRandomScore(0.82, 0.92),
          consistency: getRandomScore(0.72, 0.82),
          timeliness: getRandomScore(0.68, 0.78),
          validity: getRandomScore(0.78, 0.88)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '7',
        sourceName: '新浪微博API',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.70, 0.80),
          accuracy: getRandomScore(0.65, 0.75),
          consistency: getRandomScore(0.60, 0.70),
          timeliness: getRandomScore(0.90, 0.98),
          validity: getRandomScore(0.68, 0.78)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '8',
        sourceName: '微信公众平台',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.68, 0.78),
          accuracy: getRandomScore(0.68, 0.78),
          consistency: getRandomScore(0.65, 0.75),
          timeliness: getRandomScore(0.88, 0.96),
          validity: getRandomScore(0.72, 0.83)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '9',
        sourceName: '抖音数据平台',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.68, 0.78),
          accuracy: getRandomScore(0.65, 0.75),
          consistency: getRandomScore(0.58, 0.68),
          timeliness: getRandomScore(0.92, 0.99),
          validity: getRandomScore(0.66, 0.76)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '10',
        sourceName: '小红书内容API',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.65, 0.75),
          accuracy: getRandomScore(0.62, 0.72),
          consistency: getRandomScore(0.58, 0.68),
          timeliness: getRandomScore(0.92, 0.98),
          validity: getRandomScore(0.68, 0.78)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '11',
        sourceName: 'LinkedIn数据源',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.78, 0.88),
          accuracy: getRandomScore(0.80, 0.89),
          consistency: getRandomScore(0.75, 0.84),
          timeliness: getRandomScore(0.76, 0.85),
          validity: getRandomScore(0.78, 0.88)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '12',
        sourceName: '知乎问答数据',
        sourceType: '社交媒体',
        metrics: {
          completeness: getRandomScore(0.72, 0.82),
          accuracy: getRandomScore(0.74, 0.83),
          consistency: getRandomScore(0.66, 0.76),
          timeliness: getRandomScore(0.80, 0.90),
          validity: getRandomScore(0.72, 0.81)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '13',
        sourceName: '上海证券交易所',
        sourceType: '金融数据库',
        metrics: {
          completeness: getRandomScore(0.93, 0.98),
          accuracy: getRandomScore(0.94, 0.99),
          consistency: getRandomScore(0.92, 0.98),
          timeliness: getRandomScore(0.90, 0.97),
          validity: getRandomScore(0.95, 0.99)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '14',
        sourceName: '深圳证券交易所',
        sourceType: '金融数据库',
        metrics: {
          completeness: getRandomScore(0.92, 0.98),
          accuracy: getRandomScore(0.93, 0.98),
          consistency: getRandomScore(0.91, 0.97),
          timeliness: getRandomScore(0.89, 0.97),
          validity: getRandomScore(0.94, 0.99)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '15',
        sourceName: 'AURA客户CRM系统',
        sourceType: '企业内部系统',
        metrics: {
          completeness: getRandomScore(0.75, 0.85),
          accuracy: getRandomScore(0.78, 0.87),
          consistency: getRandomScore(0.70, 0.78),
          timeliness: getRandomScore(0.82, 0.88),
          validity: getRandomScore(0.76, 0.85)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      },
      {
        id: '16',
        sourceName: '第三方市场调研数据',
        sourceType: '外部数据源',
        metrics: {
          completeness: getRandomScore(0.73, 0.83),
          accuracy: getRandomScore(0.70, 0.80),
          consistency: getRandomScore(0.65, 0.75),
          timeliness: getRandomScore(0.60, 0.70),
          validity: getRandomScore(0.68, 0.78)
        },
        overall: 0,
        lastUpdated: getRandomTime()
      }
    ].map(source => {
      // 计算总体评分
      let total = 0;
      let count = 0;
      for (const key in source.metrics) {
        total += source.metrics[key];
        count++;
      }
      source.overall = count > 0 ? Math.round((total / count) * 100) / 100 : 0;
      return source;
    });
  };

  // 格式化趋势显示
  const formatTrend = useCallback((trend) => {
    if (!trend && trend !== 0) return <span className="neutral-trend">0%</span>;
    
    if (trend > 0) {
      return <span className="positive-trend">+{(trend * 100).toFixed(1)}%</span>;
    } else if (trend < 0) {
      return <span className="negative-trend">{(trend * 100).toFixed(1)}%</span>;
    }
    return <span className="neutral-trend">0%</span>;
  }, []);
  
  // 获取数据源的趋势数据
  const getTrend = useCallback((source, metric) => {
    if (!source || !source.id) return 0;
    
    const sourceTrends = trendData.current.get(source.id);
    if (sourceTrends && sourceTrends[metric] !== undefined) {
      return sourceTrends[metric];
    }
    
    return 0;
  }, []);
  
  // 获取改进建议
  const getImprovementSuggestions = useCallback((metric, score) => {
    if (score >= 0.8) return ['当前状态良好，继续保持监控'];
    
    const suggestions = {
      'completeness': [
        '检查数据采集过程中的丢失点',
        '优化表单设计，减少可选字段',
        '实施强制性字段验证'
      ],
      'accuracy': [
        '增加数据验证规则',
        '实施双重检查机制',
        '建立与权威数据源的对比流程'
      ],
      'consistency': [
        '统一各系统数据格式标准',
        '建立主数据管理体系',
        '实施跨系统数据一致性检查'
      ],
      'timeliness': [
        '优化数据更新频率',
        '减少数据处理延迟',
        '建立数据时效性监控预警'
      ],
      'validity': [
        '增强输入验证规则',
        '实施业务规则引擎',
        '定期进行数据有效性审计'
      ]
    };
    
    return suggestions[metric] || ['需要分析具体问题并制定改进计划'];
  }, []);

  return (
    <div className={`data-quality-container${highlight ? ' data-update-highlight' : ''}`}>
      <div className="matrix-header">
        <div>
          <h3 className="data-quality-title">数据质量矩阵</h3>
          <p className="data-quality-description">
            监控各数据源不同质量维度的评分，确保数据分析和AI模型的数据质量。
          </p>
        </div>
        <div className="header-actions">
          <button 
            className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
          >
            <span className="refresh-icon"></span>
            {isRefreshing ? '刷新中...' : '刷新数据'}
          </button>
          <button 
            className="reset-button"
            onClick={() => resetDataRef.current?.()}
            disabled={loading || isRefreshing}
          >
            <span className="reset-icon"></span>
            重置数据
          </button>
          <div className="last-update">
            最近更新: {new Date(lastUpdated).toLocaleString('zh-CN', { 
              year: 'numeric', month: 'numeric', day: 'numeric', 
              hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载数据质量信息...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <div className="error-icon">!</div>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            重试
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-data-message">
          <p>暂无数据可显示。请检查数据源连接或刷新页面重试。</p>
          <div className="empty-actions">
            <button className="retry-button" onClick={handleManualRefresh}>重试</button>
            <button 
              className="reset-button" 
              onClick={() => {
                // 直接使用ref调用，避免可能的依赖问题
                resetDataRef.current?.();
              }}
            >
              重置数据
            </button>
          </div>
        </div>
      ) : (
        <div className={`matrix-container ${isRefreshing ? 'refreshing-container' : ''}`}>
          <table className="quality-matrix">
            <thead>
              <tr>
                <th 
                  className={`sortable ${sortConfig.key === 'sourceName' ? 'sorted' : ''}`}
                  onClick={() => handleSort('sourceName')}
                >
                  数据源
                  {sortConfig.key === 'sourceName' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortConfig.key === 'sourceType' ? 'sorted' : ''}`}
                  onClick={() => handleSort('sourceType')}
                >
                  类型
                  {sortConfig.key === 'sourceType' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                {metricKeys.map(metric => (
                  <th 
                    key={metric}
                    className={`sortable metric-header ${sortConfig.key === metric ? 'sorted' : ''}`}
                    onClick={() => handleSort(metric)}
                  >
                    {metricNames[metric]}
                    {sortConfig.key === metric && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </span>
                    )}
                  </th>
                ))}
                <th 
                  className={`sortable overall-header ${sortConfig.key === 'overall' ? 'sorted' : ''}`}
                  onClick={() => handleSort('overall')}
                >
                  总体
                  {sortConfig.key === 'overall' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
                <th 
                  className={`sortable ${sortConfig.key === 'lastUpdated' ? 'sorted' : ''}`}
                  onClick={() => handleSort('lastUpdated')}
                >
                  更新时间
                  {sortConfig.key === 'lastUpdated' && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((source, rowIndex) => (
                <tr key={source.id || rowIndex}>
                  <td className="source-name">{source.sourceName}</td>
                  <td className="source-type">{source.sourceType}</td>
                  
                  {/* 指标列 */}
                  {metricKeys.map(metric => {
                    const score = source.metrics && source.metrics[metric] !== undefined 
                      ? source.metrics[metric] 
                      : 0;
                    const cellId = `${source.id || rowIndex}-${metric}`;
                    const isRefreshing = refreshingCells.has(cellId);
                    
                    return (
                      <td 
                        key={metric}
                        className={`metric-cell ${getScoreColorClass(score)} ${isRefreshing ? 'refreshing' : ''}`}
                        onClick={(e) => handleCellClick(e, rowIndex, metric)}
                        onMouseEnter={(e) => handleCellHover(e, rowIndex, metric)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {/* 涟漪动画效果 */}
                        {animatedCell && 
                         animatedCell.active && 
                         animatedCell.rowIndex === rowIndex && 
                         animatedCell.metric === metric && (
                          <span 
                            className="ripple-effect"
                            style={{ 
                              left: animatedCell.x + 'px', 
                              top: animatedCell.y + 'px' 
                            }}
                          ></span>
                        )}
                        
                        {/* 分数和趋势显示 */}
                        <div className="score-display">
                          <span className={`score-value ${isRefreshing ? 'refreshing-text' : ''}`}>
                            {(score * 100).toFixed(0)}
                          </span>
                          <span className="trend-value">
                            {formatTrend(getTrend(source, metric))}
                          </span>
                        </div>
                        
                        {/* 刷新动画 */}
                        {isRefreshing && (
                          <div className="refresh-highlight"></div>
                        )}
                      </td>
                    );
                  })}
                  
                  {/* 总体评分列 */}
                  <td className={`metric-cell overall-cell ${getScoreColorClass(source.overall || 0)}`}>
                    <div className="score-display">
                      <span className="overall-value">
                        {((source.overall || 0) * 100).toFixed(0)}
                      </span>
                    </div>
                  </td>
                  
                  {/* 最后更新时间列 */}
                  <td className="last-updated">
                    {source.lastUpdated ? new Date(source.lastUpdated).toLocaleString('zh-CN', { 
                      month: 'numeric', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* 分页控制 */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                首页
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              
              <div className="pagination-info">
                第 {currentPage} 页，共 {totalPages} 页（{data.length} 个数据源）
              </div>
              
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                末页
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 自动刷新提示 */}
      <div className={`auto-refresh-indicator ${isRefreshing ? 'active-refresh' : ''}`}>
        <div className="refresh-icon-small"></div>
        <span>数据自动刷新中</span>
        {isRefreshing && <span className="refresh-notification">正在刷新数据...</span>}
      </div>
      
      {/* 数据问题提示 */}
      {(showResetHint || data.length === 0) && (
        <div className="data-reset-hint">
          <span className="hint-icon">!</span>
          <span className="hint-text">如果数据显示有问题，请点击"重置数据"按钮刷新</span>
        </div>
      )}
      
      {/* 图例说明 */}
      <div className="matrix-legend">
        <div className="legend-item">
          <span className="legend-color high-legend"></span>
          <span className="legend-text">80-100: 优</span>
        </div>
        <div className="legend-item">
          <span className="legend-color medium-legend"></span>
          <span className="legend-text">60-79: 良</span>
        </div>
        <div className="legend-item">
          <span className="legend-color low-legend"></span>
          <span className="legend-text">&lt;60: 需改进</span>
        </div>
        <div className="legend-item guide">
          <span className="legend-icon">🛈</span>
          <span className="legend-text">鼠标悬停查看详情，点击进入分析</span>
        </div>
      </div>
      
      {/* 详情信息卡片 */}
      {hoveredCell && paginatedData[hoveredCell.rowIndex] && (
        <div 
          className="cell-info-card"
          style={{
            left: `${hoveredCell.x}px`,
            top: `${hoveredCell.y + 20}px`
          }}
        >
          <div className="info-card-header">
            <h4 className="info-card-title">
              {metricNames[hoveredCell.metric]} - {paginatedData[hoveredCell.rowIndex].sourceName}
            </h4>
            <div className="info-card-score">
              <span className={`score-badge ${getScoreColorClass(
                paginatedData[hoveredCell.rowIndex].metrics?.[hoveredCell.metric] || 0
              )}`}>
                {((paginatedData[hoveredCell.rowIndex].metrics?.[hoveredCell.metric] || 0) * 100).toFixed(0)}
              </span>
            </div>
          </div>
          
          <div className="info-card-description">
            <p>{metricDescriptions[hoveredCell.metric]}</p>
          </div>
          
          <div className="info-card-section">
            <h5 className="info-card-section-title">改进建议</h5>
            <ul className="suggestions-list">
              {getImprovementSuggestions(
                hoveredCell.metric, 
                paginatedData[hoveredCell.rowIndex].metrics?.[hoveredCell.metric] || 0
              ).map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          </div>
          
          <div className="info-card-section">
            <h5 className="info-card-section-title">趋势</h5>
            <div className="trend-info">
              {formatTrend(getTrend(paginatedData[hoveredCell.rowIndex], hoveredCell.metric))} 相比上月
            </div>
          </div>
          
          <div className="info-card-footer">
            点击查看详情
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQualityMatrix;
