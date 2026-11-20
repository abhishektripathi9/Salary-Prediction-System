import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import BellCurveChart from './BellCurveChart';
import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react';

export default function MarketDistributionCard({ prediction, bellCurveData }) {
  const { formatLacs } = useCurrency();

  const ctc = prediction?.predicted_ctc || 4052000;
  const marketPos = prediction?.market_position || {
    top_percentile: 6.1,
    percentile_label: 'Top 6.1%',
    decile_label: 'Top Decile',
    market_median: 2532000,
    diff_pct: 59.9,
    diff_label: '+59.9% Above'
  };

  return (
    <div className="exec-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Market Distribution
          </h2>
          <p className="text-xs text-slate-400">Positioning across tech cohorts</p>
        </div>
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
          N = 3,420 Offers
        </span>
      </div>

      {/* Bell-Curve Area Chart */}
      <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
        <BellCurveChart userCtc={ctc} bellCurveData={bellCurveData} />
      </div>

      {/* 3 Summary Metric Boxes */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Median */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Market Median
          </span>
          <div className="mt-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              {formatLacs(marketPos.market_median)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">50th percentile</span>
        </div>

        {/* Benchmark */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Benchmark
          </span>
          <div className="mt-1">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              {formatLacs(ctc)}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 tabular-nums">
            {marketPos.diff_label}
          </span>
        </div>

        {/* Rank (Emerald-tinted) */}
        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            Rank
          </span>
          <div className="mt-1">
            <span className="text-sm sm:text-base font-extrabold text-emerald-950 tabular-nums">
              {marketPos.percentile_label}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 mt-1">
            {marketPos.decile_label}
          </span>
        </div>
      </div>

      {/* Insights Card */}
      <div className="p-3.5 rounded-lg bg-slate-900 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Negotiation Leverage:</span>
              <span className="text-emerald-400">High</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              YoY Market Growth: <strong className="text-slate-200">+14.2%</strong>
            </div>
          </div>
        </div>

        <Link
          to="/benchmarks"
          className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition"
        >
          <span>Full Matrix</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
