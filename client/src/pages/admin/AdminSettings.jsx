import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Key, Shield, Terminal, Copy, Check } from 'lucide-react';

export default function AdminSettings() {
  const [copied, setCopied] = useState(false);
  const apiKey = 'sk_live_salaryai_98fbc923a10972bc711e9a';

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Admin Settings & API Keys</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure platform parameters, REST API credentials, and inference limits
          </p>
        </div>

        {/* API Key Card */}
        <div className="exec-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Production API Key</span>
          </div>
          <p className="text-xs text-slate-500">
            Use this key to authenticate external ATS and HRIS integrations into the SalaryAI inference engine.
          </p>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800">
            <span className="flex-1 truncate">{apiKey}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 text-xs font-sans font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* API Curl Example */}
        <div className="exec-card p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Sample Live Inference Endpoint</span>
          </div>

          <pre className="p-4 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed">
{`curl -X POST https://api.salaryai.in/api/predict \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "candidate_role": "ML / AI Engineer",
    "experience_years": 10.5,
    "skill_rank": 88,
    "education_level": "Bachelor\\'s",
    "workloads_count": 14,
    "location_tier": "Tier 1 Metro (BLR/MUM/NCR)",
    "company_tier": "Growth Mid-Market ($50M-$250M ARR)"
  }'`}
          </pre>
        </div>

        {/* Engine Parameters */}
        <div className="exec-card p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Shield className="w-4 h-4 text-slate-600" />
            <span>Inference Confidence Boundary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium block">Confidence Interval Spread</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">90% (±7.5%)</span>
              <span className="text-[11px] text-slate-400 mt-1 block">Calibrated on test holdout</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 font-medium block">Default Serving Engine</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">Random Forest v4.2.0</span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">R² 0.942 Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
