import React from 'react';
import Navbar from '../components/Navbar';
import { Cpu, Database, CheckCircle2, Sliders, Shield, Scale } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="pb-8 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Explainable AI & ML Specification
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-3">
            Compensation Modeling & Leveling Methodology
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            SalaryAI leverages multi-variable Scikit-Learn regression pipelines trained on 2,540 verified tech compensation records. Here is how our architecture maintains R² &gt; 0.94 without demographic bias.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 text-sm text-slate-700">
          {/* Section 1 */}
          <div className="exec-card p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Cpu className="w-5 h-5 text-slate-900" />
              <h2>1. Multi-Model Regression Architecture</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              We benchmark three distinct algorithms to ensure robust, non-linear modeling across both early-career engineers and staff/principal levels:
            </p>
            <ul className="text-xs space-y-2 text-slate-600 list-disc pl-5 mt-1">
              <li>
                <strong className="text-slate-900">RandomForestRegressor v4.2.0 (Ensemble Forest):</strong> Primary active engine. Consists of 120 estimators with maximum depth 14, delivering an R² score of ~0.942 and minimizing variance across edge cases.
              </li>
              <li>
                <strong className="text-slate-900">GradientBoostingRegressor v4.1 (Gradient Boosted Tree):</strong> 140 sequential trees trained with learning rate 0.08 for tight residuals on high-seniority compensation.
              </li>
              <li>
                <strong className="text-slate-900">Multi-variable Ridge Regression v3.8:</strong> L2-regularized linear baseline to verify continuous monotonicity and ensure predictable marginal returns on years of experience.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="exec-card p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Database className="w-5 h-5 text-slate-900" />
              <h2>2. Dataset Sourcing & Anonymization Cohort</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The benchmark pool includes 2,540 tech compensation records gathered across BLR, MUM, NCR, HYD, PUN, and Remote tiers. Each record contains verified CTC, base pay, annual bonus, and equity vesting schedules. Outliers beyond 3 standard deviations are clipped to avoid skew from one-off liquidity events.
            </p>
          </div>

          {/* Section 3 */}
          <div className="exec-card p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Scale className="w-5 h-5 text-slate-900" />
              <h2>3. Feature Weighting & SHAP Attribution</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Model interpretability is derived from Shapley additive explanations (SHAP). The current model allocates weights as follows:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Total Experience</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">77.7%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">System & Skill Rank</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">13.2%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Education Level</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">5.8%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Job Role</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">1.7%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Company Tier</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">1.6%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
