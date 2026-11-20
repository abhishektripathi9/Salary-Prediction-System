import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  // 'INR' or 'LACS'
  const [currencyMode, setCurrencyMode] = useState('INR');

  const formatSalary = (val) => {
    if (val === null || val === undefined) return '—';
    const num = Number(val);
    if (currencyMode === 'LACS') {
      const lacs = (num / 100000).toFixed(2);
      return `₹${lacs} Lacs`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatLacs = (val) => {
    if (val === null || val === undefined) return '—';
    return `₹${(Number(val) / 100000).toFixed(1)}L`;
  };

  const toggleCurrency = () => {
    setCurrencyMode((prev) => (prev === 'INR' ? 'LACS' : 'INR'));
  };

  return (
    <CurrencyContext.Provider value={{ currencyMode, setCurrencyMode, toggleCurrency, formatSalary, formatLacs }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
