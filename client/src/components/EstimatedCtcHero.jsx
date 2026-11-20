import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ShieldCheck, Activity, BarChart2 } from 'lucide-react';

export default function EstimatedCtcHero({ prediction, loading }) {
  const { formatSalary, formatLacs } = useCurrency();

  const ctc = prediction?.predicted_ctc || 4052000;
  const minCtc = prediction?.min_ctc || 3750000;
  const maxCtc = prediction?.max_ctc || 4360000;
  const breakdown = prediction?.package_breakdown || {
    base_pct: 70,
    base_inr: 2836400,
    bonus_pct: 18,
    bonus_inr: 729360,
    equity_pct: 12,
    equity_inr: 486240
  };

  const weights = prediction?.feature_weights || {
    "Total Experience Vector": 77.7,
    "Skill Assessment & System Rank": 13.2,
    "Education Tier": 5.8,
    "Job Role": 1.7,
    "Company Tier": 1.6
  };

  const lpa = (ctc / 100000).toFixed(2);

  return (
    <div className="exec-card-hero p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Loading overlay for smooth transition */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium shadow-md">
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Evaluating ML Pipeline...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Estimated Annual CTC
          </h2>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            GROSS CTC
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE INFERENCE</span>
        </div>
      </div>

      {/* Hero Figure */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatSalary(ctc)}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ year</span>
        </div>

        {/* Sub-pill row: LPA + Confidence Interval */}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
            ₹{lpa} LPA
          </span>
          <span className="text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 tabular-nums">
            90% CI: {formatLacs(minCtc)} – {formatLacs(maxCtc)}
          </span>
        </div>
      </div>

      {/* 3-Column Package Breakdown Mini-Cards */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Compensation Breakdown
        </span>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Base */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>BASE</span>
                <span className="font-bold text-slate-700 tabular-nums">{breakdown.base_pct}%</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                {formatSalary(breakdown.base_inr)}
              </div>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-slate-900 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.base_pct}%` }}
              ></div>
            </div>
          </div>

          {/* Bonus */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>BONUS</span>
                <span className="font-bold text-slate-700 tabular-nums">{breakdown.bonus_pct}%</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                {formatSalary(breakdown.bonus_inr)}
              </div>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.bonus_pct}%` }}
              ></div>
            </div>
          </div>

          {/* Equity */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>EQUITY</span>
                <span className="font-bold text-slate-700 tabular-nums">{breakdown.equity_pct}%</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                {formatSalary(breakdown.equity_inr)}
              </div>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${breakdown.equity_pct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Weight & Impact (SHAP) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Feature Weight & Impact (SHAP)
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Marginal contribution</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {Object.entries(weights).map(([featureName, weightPct]) => (
            <div key={featureName} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{featureName}</span>
                <span className="text-slate-900 font-bold tabular-nums">{weightPct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className="bg-slate-800 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, weightPct)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
