import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MAIN_FINANCIAL_ITEMS } from '../../constants';

const MainItemsSelector = ({ selectedItems, onChange, company, isActive = true }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownBtnRef = useRef();
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 180 });

  // Position the dropdown when it's shown
  useEffect(() => {
    if (showDropdown && dropdownBtnRef.current) {
      const rect = dropdownBtnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width || 180
      });
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    
    const handleClick = (e) => {
      if (
        dropdownBtnRef.current &&
        !dropdownBtnRef.current.contains(e.target) &&
        document.getElementById('main-items-dropdown-portal') &&
        !document.getElementById('main-items-dropdown-portal').contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  // Group main financial items by type for the dropdown
  const groupedMainItems = {
    asset: MAIN_FINANCIAL_ITEMS.filter(item => item.type === 'asset'),
    liability: MAIN_FINANCIAL_ITEMS.filter(item => item.type === 'liability'),
    equity: MAIN_FINANCIAL_ITEMS.filter(item => item.type === 'equity'),
    income: MAIN_FINANCIAL_ITEMS.filter(item => item.type === 'income')
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        ref={dropdownBtnRef} 
        onClick={() => setShowDropdown(v => !v)}
        style={{
          margin: '0 2px', 
          padding: '4px 12px', 
          borderRadius: 8, 
          border: isActive ? '2px solid #40a9ff' : '1.5px solid #223366', 
          background: isActive ? 'linear-gradient(90deg, #40a9ff 60%, #1e90ff 100%)' : '#223366', 
          color: isActive ? '#fff' : '#b3cfff', 
          fontWeight: 700, 
          fontSize: 15, 
          cursor: 'pointer', 
          boxShadow: isActive ? '0 0 8px #40a9ff55' : 'none', 
          transition: 'all 0.18s', 
          outline: 'none', 
          letterSpacing: 1,
        }}
      >
        主要项目 ▾
      </button>
      
      {showDropdown && createPortal(
        <div 
          id="main-items-dropdown-portal" 
          style={{ 
            position: 'fixed', 
            top: dropdownPos.top, 
            left: dropdownPos.left, 
            background: '#223366', 
            border: '1.5px solid #40a9ff', 
            borderRadius: 10, 
            boxShadow: '0 2px 12px #22336655', 
            zIndex: 9999, 
            minWidth: Math.max(dropdownPos.width, 240), 
            maxWidth: 320,
            maxHeight: 500,
            overflowY: 'auto',
            padding: 12 
          }}
        >
          <div style={{ marginBottom: 6, fontSize: 15, fontWeight: 700, color: '#40a9ff', borderBottom: '1px solid #40a9ff', paddingBottom: 6 }}>
            资产项目
          </div>
          {groupedMainItems.asset.map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 14, margin: '4px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.key)} 
                onChange={e => {
                  const next = e.target.checked 
                    ? [...selectedItems, item.key] 
                    : selectedItems.filter(k => k !== item.key);
                  onChange(next);
                }} 
                style={{ accentColor: '#40a9ff', width: 16, height: 16 }} 
              />
              {item.label}
            </label>
          ))}

          <div style={{ marginTop: 12, marginBottom: 6, fontSize: 15, fontWeight: 700, color: '#40a9ff', borderBottom: '1px solid #40a9ff', paddingBottom: 6 }}>
            负债项目
          </div>
          {groupedMainItems.liability.map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 14, margin: '4px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.key)} 
                onChange={e => {
                  const next = e.target.checked 
                    ? [...selectedItems, item.key] 
                    : selectedItems.filter(k => k !== item.key);
                  onChange(next);
                }} 
                style={{ accentColor: '#40a9ff', width: 16, height: 16 }} 
              />
              {item.label}
            </label>
          ))}

          <div style={{ marginTop: 12, marginBottom: 6, fontSize: 15, fontWeight: 700, color: '#40a9ff', borderBottom: '1px solid #40a9ff', paddingBottom: 6 }}>
            所有者权益项目
          </div>
          {groupedMainItems.equity.map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 14, margin: '4px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.key)} 
                onChange={e => {
                  const next = e.target.checked 
                    ? [...selectedItems, item.key] 
                    : selectedItems.filter(k => k !== item.key);
                  onChange(next);
                }} 
                style={{ accentColor: '#40a9ff', width: 16, height: 16 }} 
              />
              {item.label}
            </label>
          ))}

          <div style={{ marginTop: 12, marginBottom: 6, fontSize: 15, fontWeight: 700, color: '#40a9ff', borderBottom: '1px solid #40a9ff', paddingBottom: 6 }}>
            损益表项目
          </div>
          {groupedMainItems.income.map(item => (
            <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#eaf6ff', fontWeight: 600, fontSize: 14, margin: '4px 0', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={selectedItems.includes(item.key)} 
                onChange={e => {
                  const next = e.target.checked 
                    ? [...selectedItems, item.key] 
                    : selectedItems.filter(k => k !== item.key);
                  onChange(next);
                }} 
                style={{ accentColor: '#40a9ff', width: 16, height: 16 }} 
              />
              {item.label}
            </label>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default MainItemsSelector; 