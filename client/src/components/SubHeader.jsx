import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SubHeader() {
  return (
    <div className="w-full border-b border-slate-200/80 bg-white/60 py-6 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Tech Compensation & Leveling Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-model Scikit-Learn regression trained on 2,540 verified Indian tech offers across Tier-1/2 metros and global remote tiers.
            </p>
          </div>

          <div className="self-start md:self-center flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Bands: 48,200+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
