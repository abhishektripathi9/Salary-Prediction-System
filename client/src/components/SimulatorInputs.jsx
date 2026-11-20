import React from 'react';
import { Sparkles, Info, TrendingUp, BookmarkPlus, Minus, Plus } from 'lucide-react';

export default function SimulatorInputs({
  profile,
  onChange,
  onSaveProfile,
  onSimulatePromotion,
  isPromoted,
  isSaving
}) {
  const roles = [
    'ML / AI Engineer',
    'Senior Backend Engineer',
    'Lead Product Designer',
    'Full Stack Engineer',
    'Engineering Manager',
    'SDE-1',
    'SDE-2'
  ];

  const locations = [
    'Tier 1 Metro (BLR/MUM/NCR)',
    'Tier 2 Metro (HYD/PUN)',
    'Remote'
  ];

  const companies = [
    'Early Startup',
    'Growth Mid-Market ($50M-$250M ARR)',
    'FAANG / Tier-1 MNC'
  ];

  const educationLevels = ["Bachelor's", "Master's", "PhD / D.Sc"];

  // Compute live skill rank percentile badge
  const getSkillPercentile = (rank) => {
    if (rank >= 90) return 'Top 5%';
    if (rank >= 80) return 'Top 8%';
    if (rank >= 70) return 'Top 20%';
    if (rank >= 50) return 'Top 45%';
    return 'Base';
  };

  return (
    <div className="exec-card p-6 flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Candidate Profile
          </h2>
          <p className="text-xs text-slate-400">Configure parameters for live inference</p>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Live Input
        </span>
      </div>

      {/* 1. Target Role Dropdown */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Target Role</label>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            High Demand
          </span>
        </div>
        <select
          value={profile.candidate_role}
          onChange={(e) => onChange('candidate_role', e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 2. Total Experience Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">Total Experience</label>
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
            {profile.experience_years} Years
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="25"
          step="0.5"
          value={profile.experience_years}
          onChange={(e) => onChange('experience_years', parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0y (Fresh Grad)</span>
          <span>12.5y</span>
          <span>25y (Principal/Exec)</span>
        </div>
      </div>

      {/* 3. System & Algorithmic Rank Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700">System & Algorithmic Rank</label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              {getSkillPercentile(profile.skill_rank)}
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
              {profile.skill_rank} / 100
            </span>
          </div>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="1"
          value={profile.skill_rank}
          onChange={(e) => onChange('skill_rank', parseInt(e.target.value, 10))}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>10 (Basic)</span>
          <span>50 (Standard)</span>
          <span>100 (Staff / Fellow)</span>
        </div>
      </div>

      {/* 4. Highest Credential (Segmented Selector) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Highest Credential</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {educationLevels.map((edu) => (
            <button
              key={edu}
              type="button"
              onClick={() => onChange('education_level', edu)}
              className={`py-1.5 text-center text-xs font-medium rounded-md transition ${
                profile.education_level === edu
                  ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {edu}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Production AI Workloads Stepper */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
        <div>
          <label className="text-xs font-semibold text-slate-800 block">
            Production AI Workloads
          </label>
          <span className="text-[11px] text-slate-400">Deployed high-scale pipelines</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange('workloads_count', Math.max(0, profile.workloads_count - 1))}
            className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-2xs"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
            {profile.workloads_count}
          </span>
          <button
            type="button"
            onClick={() => onChange('workloads_count', Math.min(30, profile.workloads_count + 1))}
            className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Geographic Tier Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Geographic Tier</label>
        <select
          value={profile.location_tier}
          onChange={(e) => onChange('location_tier', e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition"
        >
          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* 7. Company Tier Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700">Company Tier</label>
        <select
          value={profile.company_tier}
          onChange={(e) => onChange('company_tier', e.target.value)}
          className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-slate-900 transition"
        >
          {companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={onSaveProfile}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white py-2.5 px-4 rounded-lg text-xs font-semibold transition shadow-xs disabled:opacity-60"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>{isSaving ? 'Saving Profile...' : 'Save Candidate Profile'}</span>
        </button>

        <button
          type="button"
          onClick={onSimulatePromotion}
          className={`w-full flex items-center justify-center gap-2 border py-2.5 px-4 rounded-lg text-xs font-semibold transition ${
            isPromoted
              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{isPromoted ? 'Reset Trajectory' : 'Simulate +2 Yrs Promotion Trajectory'}</span>
        </button>
      </div>

      {/* Bias-Corrected Estimator Info Card */}
      <div className="mt-1 p-3 bg-slate-50/80 border border-slate-200 rounded-lg flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong className="text-slate-700">Bias-Corrected Estimator:</strong> Multi-factor regression adjusts for location-indexed purchasing parity and removes non-merit negotiation drift.
        </p>
      </div>
    </div>
  );
}
