import React from 'react';
import { COMPANIES } from '../constants';

const CompanyInfoSection = ({ companyId }) => {
  const company = COMPANIES.find(c => c.id === companyId);
  if (!company) return null;
  return (
    <section style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 18 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: '#40a9ff', letterSpacing: 1 }}>{company.name}</div>
      <div style={{ color: '#b3cfff', fontWeight: 600, fontSize: 16 }}>{company.desc}</div>
    </section>
  );
};

export default CompanyInfoSection; 