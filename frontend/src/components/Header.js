import React, { useState, useRef, useEffect } from 'react';
import { COMPANIES } from '../constants';
import { Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const DATA_PLATFORM_TABS = [
  { key: 'dashboard', label: '可视化仪表盘' },
  { key: 'data-sources', label: '数据源管理' },
  { key: 'data-quality', label: '数据质量' },
  { key: 'ingestion', label: '数据摄入统计' },
  { key: 'features', label: '特征工程' },
  { key: 'models', label: '模型管理' },
  { key: 'model-perf', label: '模型性能' },
  { key: 'model-health', label: '模型健康度' },
];

const Header = ({ currentCompanyId, onSetCompany, companiesData, lakeType, setLakeType }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/';
  const isDataPlatform = location.pathname.startsWith('/data-platform');
  const isDataLake = location.pathname.startsWith('/datalake');
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef();
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 180 });
  const moreBtnRef = useRef();

  // 关闭下拉菜单的点击外部处理
  useEffect(() => {
    const handleClick = (e) => {
      if (showMore && moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMore]);

  useEffect(() => {
    if (showMore && moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [showMore]);

  // 控制最多显示5个，剩下的放到下拉菜单
  const visibleTabs = DATA_PLATFORM_TABS.slice(0, 3);
  const moreTabs = DATA_PLATFORM_TABS.slice(3);

  return (
    <header style={{
      display: 'flex', alignItems: 'center', padding: '18px 40px', background: 'rgba(16,43,106,0.98)',
      boxShadow: '0 2px 12px #00152933', borderBottom: '1.5px solid #223366',
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, backdropFilter: 'blur(2px)'
    }}>
      <img src="/logo.png" alt="logo" style={{ height: 56, marginRight: 24, borderRadius: 8 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginRight: 32 }}>
        <Link to="/">
          <button style={{
            background: location.pathname === '/' ? '#4be1a0' : 'rgba(34,51,102,0.85)',
            color: location.pathname === '/' ? '#15294e' : '#b3cfff',
            fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 22px', cursor: 'pointer',
            boxShadow: location.pathname === '/' ? '0 2px 8px #4be1a055' : 'none',
            transition: 'all 0.18s', letterSpacing: 1
          }}>公司概览</button>
        </Link>
        <Link to="/data-platform">
          <button style={{
            background: isDataPlatform ? '#4be1a0' : 'rgba(34,51,102,0.85)',
            color: isDataPlatform ? '#15294e' : '#b3cfff',
            fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 22px', cursor: 'pointer',
            boxShadow: isDataPlatform ? '0 2px 8px #4be1a055' : 'none',
            transition: 'all 0.18s', letterSpacing: 1
          }}>数智中台</button>
        </Link>
        <Link to="/datalake">
          <button style={{
            background: location.pathname.startsWith('/datalake') ? '#4be1a0' : 'rgba(34,51,102,0.85)',
            color: location.pathname.startsWith('/datalake') ? '#15294e' : '#b3cfff',
            fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 8, padding: '8px 22px', cursor: 'pointer',
            boxShadow: location.pathname.startsWith('/datalake') ? '0 2px 8px #4be1a055' : 'none',
            transition: 'all 0.18s', letterSpacing: 1
          }}>数据湖</button>
        </Link>
      </div>
      <h2 style={{ flex: 1, color: '#40a9ff', margin: 0, fontWeight: 800, letterSpacing: 2, fontSize: 23, textShadow: '0 2px 8px #00152955' }}>
        AURA智能审计风险平台
      </h2>
      
      {/* 公司类型切换按钮 - 只在数据湖页面显示 */}
      {isDataLake && (
        <div style={{ display: 'flex', gap: 10, marginRight: 20 }}>
          {['AURA稳健', 'BETA成长', 'CRISIS压力'].map(type => (
            <button
              key={type}
              style={{
                background: lakeType === type ? '#4be1a0' : 'rgba(34,51,102,0.85)',
                color: lakeType === type ? '#15294e' : '#b3cfff',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s'
              }}
              onClick={() => setLakeType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}
      {isDataPlatform && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 24, maxWidth: 900, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          {visibleTabs.map(tab => (
            <NavLink
              key={tab.key}
              to={`/data-platform/${tab.key}`}
              style={({ isActive }) => ({
                background: isActive ? '#4be1a0' : 'rgba(34,51,102,0.85)',
                color: isActive ? '#15294e' : '#b3cfff',
                fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 7, padding: '5px 14px', cursor: 'pointer',
                boxShadow: isActive ? '0 2px 8px #4be1a055' : 'none',
                transition: 'all 0.18s', letterSpacing: 1, marginRight: 0,
                outline: 'none', textDecoration: 'none',
                minWidth: 0, minHeight: 0, lineHeight: 1.2
              })}
            >{tab.label}</NavLink>
          ))}
          <div style={{ position: 'relative', display: 'inline-block' }} ref={moreRef}>
            <button
              ref={moreBtnRef}
              style={{
                background: 'rgba(34,51,102,0.85)', color: '#b3cfff', fontWeight: 600, fontSize: 14,
                border: 'none', borderRadius: 7, padding: '5px 14px', cursor: 'pointer', marginLeft: 0,
                outline: 'none', minWidth: 0, minHeight: 0, lineHeight: 1.2
              }}
              onClick={() => setShowMore(v => !v)}
            >
              更多 ▾
            </button>
            {showMore && createPortal(
              <div
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  background: '#223366',
                  borderRadius: 8,
                  boxShadow: '0 2px 12px #00152955',
                  minWidth: dropdownPos.width,
                  zIndex: 9999,
                  padding: '4px 0',
                  whiteSpace: 'normal',
                  pointerEvents: 'auto'
                }}
                onMouseDown={e => e.stopPropagation()}
              >
                {moreTabs.map(tab => (
                  <div
                    key={tab.key}
                    style={{
                      display: 'block',
                      background: location.pathname.endsWith(tab.key) ? '#4be1a0' : 'transparent',
                      color: location.pathname.endsWith(tab.key) ? '#15294e' : '#eaf6ff',
                      fontWeight: 600, fontSize: 14, border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer',
                      textAlign: 'left', margin: 0, textDecoration: 'none',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setShowMore(false);
                      navigate(`/data-platform/${tab.key}`);
                    }}
                  >{tab.label}</div>
                ))}
              </div>,
              document.body
            )}
          </div>
        </nav>
      )}
      {isDashboard && (
        <div>
          {COMPANIES.map(c => (
            <button
              key={c.id}
              onClick={() => onSetCompany(c.id)}
              style={{
                margin: '0 10px', padding: '10px 28px', borderRadius: 22,
                border: currentCompanyId === c.id ? '2px solid #40a9ff' : '2px solid #223366',
                background: currentCompanyId === c.id ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : 'rgba(34,51,102,0.85)',
                color: currentCompanyId === c.id ? '#fff' : '#b3cfff',
                fontWeight: 700, cursor: 'pointer', fontSize: 17,
                boxShadow: currentCompanyId === c.id ? '0 0 12px #40a9ff88' : 'none',
                transition: 'all 0.18s', outline: 'none', letterSpacing: 1,
              }}
              onMouseOver={e => { if (currentCompanyId !== c.id) e.currentTarget.style.background = 'linear-gradient(90deg, #40a9ffCC 60%, #1e90ffCC 100%)'; }}
              onMouseOut={e => { if (currentCompanyId !== c.id) e.currentTarget.style.background = 'rgba(34,51,102,0.85)';}}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header; 