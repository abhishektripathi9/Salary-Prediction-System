import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const { currencyMode, toggleCurrency } = useCurrency();
  const { user, logout } = useAuth();
  const [modelInfo, setModelInfo] = useState({
    short_name: 'Ensemble Forest',
    r2_score: 0.942
  });

  useEffect(() => {
    fetch('/api/ml/metadata')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.active_model_short) {
          setModelInfo({
            short_name: data.active_model_short,
            r2_score: data.active_r2
          });
        }
      })
      .catch((err) => console.log('Metadata fetch error:', err));
  }, []);

  const navLinks = [
    { name: 'Predictor', path: '/' },
    { name: 'Market Benchmarks', path: '/benchmarks' },
    { name: 'Saved Profiles', path: '/saved' },
    { name: 'Methodology', path: '/methodology' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Version Badge + Live Model Pill */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-sm">
                S
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">
                SalaryAI
              </span>
            </Link>

            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              v4.2
            </span>

            {/* Live Model & Accuracy green pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{modelInfo.short_name} • R² {Number(modelInfo.r2_score).toFixed(3)}</span>
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
            {navLinks.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>

          {/* Right: Currency Toggle + Live Feed + Sign In */}
          <div className="flex items-center gap-3">
            {/* Currency Toggle */}
            <button
              onClick={toggleCurrency}
              title="Toggle display format between Full INR and Lacs"
              className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs"
            >
              <span className={currencyMode === 'INR' ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                ₹ INR
              </span>
              <span className="mx-1 text-slate-300">/</span>
              <span className={currencyMode === 'LACS' ? 'text-slate-900 font-bold' : 'text-slate-400'}>
                Lacs
              </span>
            </button>

            {/* Live Market Feed Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Live Market Feed</span>
            </div>

            {/* Auth CTA or User Pill */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-700 hidden sm:inline">
                  {user.full_name}
                </span>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg transition shadow-xs"
              >
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
