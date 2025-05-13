import React from 'react';
import { COMPANIES } from '../constants';

const Header = ({ currentCompanyId, onSetCompany }) => {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', padding: '18px 40px', background: 'rgba(16,43,106,0.98)',
      boxShadow: '0 2px 12px #00152933', borderBottom: '1.5px solid #223366',
      position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, backdropFilter: 'blur(2px)'
    }}>
      <img src="/logo.png" alt="logo" style={{ height: 44, marginRight: 28, borderRadius: 8, background: '#fff', padding: 2 }} />
      <h2 style={{ flex: 1, color: '#40a9ff', margin: 0, fontWeight: 800, letterSpacing: 2, fontSize: 28, textShadow: '0 2px 8px #00152955' }}>
        AURA 智能审计风险监控平台 DEMO
      </h2>
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
    </header>
  );
};

export default Header; 