import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Cpu,
  Target,
  Database,
  Activity,
  CheckCircle,
  Play,
  RotateCw,
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { formatSalary } = useCurrency();
  const [kpis, setKpis] = useState({
    active_model: 'Random Forest Regressor v4.2.0',
    active_r2: 0.942,
    benchmark_records: 2540,
    predictions_today: 348,
    predictions_sparkline: [18, 25, 42, 68, 92, 140, 210, 280, 312, 348]
  });

  const [models, setModels] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);
  const [logsSearch, setLogsSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('All');

  const [activatingKey, setActivatingKey] = useState(null);
  const [retraining, setRetraining] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Fetch KPI data
  const fetchKpis = () => {
    fetch('/api/admin/kpis')
      .then((res) => res.json())
      .then((data) => setKpis(data))
      .catch((err) => console.error(err));
  };

  // Fetch Models
  const fetchModels = () => {
    fetch('/api/admin/models')
      .then((res) => res.json())
      .then((data) => setModels(data))
      .catch((err) => console.error(err));
  };

  // Fetch Live Prediction Stream
  const fetchLogs = () => {
    const query = new URLSearchParams({
      page: logsPage.toString(),
      limit: '8',
      search: logsSearch,
      tier: tierFilter
    });
    fetch(`/api/admin/logs?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setLogsTotal(data.total || 0);
        setLogsPages(data.pages || 1);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchKpis();
    fetchModels();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [logsPage, tierFilter]);

  // Activate model handler
  const handleActivateModel = async (modelKey) => {
    setActivatingKey(modelKey);
    try {
      const res = await fetch('/api/admin/models/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_key: modelKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage({ type: 'success', text: data.message });
      fetchKpis();
      fetchModels();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setActivatingKey(null);
    }
  };

  // Retrain all models handler
  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await fetch('/api/admin/models/retrain', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatusMessage({ type: 'success', text: 'All 3 regression pipelines retrained & synchronized!' });
      fetchKpis();
      fetchModels();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setRetraining(false);
    }
  };

  const handleLogsSearch = (e) => {
    e.preventDefault();
    setLogsPage(1);
    fetchLogs();
  };

  // Convert sparkline numbers to Recharts format
  const sparklineData = (kpis.predictions_sparkline || []).map((val, idx) => ({ idx, val }));

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Toast Status Notification */}
        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* 1. 4 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Active ML Model */}
          <div className="exec-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active ML Model
              </span>
              <Cpu className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                {kpis.active_model}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-semibold text-emerald-700">Live Inference</span>
              </div>
            </div>
          </div>

          {/* Card 2: Model Accuracy */}
          <div className="exec-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Model Accuracy
              </span>
              <Target className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                R² {Number(kpis.active_r2).toFixed(3)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Cross-validated holdout test</p>
            </div>
          </div>

          {/* Card 3: Benchmark Records */}
          <div className="exec-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Benchmark Records
              </span>
              <Database className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {Number(kpis.benchmark_records).toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Verified Indian Tech Offers
              </p>
            </div>
          </div>

          {/* Card 4: Predictions Run Today with Sparkline */}
          <div className="exec-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Predictions Run Today
              </span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {kpis.predictions_today}
                </div>
                <span className="text-[11px] text-slate-400">API & Live Sim</span>
              </div>
              <div className="w-24 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Model Registry & Benchmark Engines Table */}
        <div className="exec-card overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Model Registry & Benchmark Engines
              </h2>
              <p className="text-xs text-slate-400">
                Toggle the active inference engine used live across the public platform
              </p>
            </div>
            <button
              onClick={handleRetrain}
              disabled={retraining}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs disabled:opacity-50 self-start sm:self-auto"
            >
              <RotateCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
              <span>{retraining ? 'Retraining All...' : 'Retrain All Models'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Model Architecture</th>
                  <th className="py-3 px-4">R² Score</th>
                  <th className="py-3 px-4">MAE (₹)</th>
                  <th className="py-3 px-4">Training Cohort</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {models.map((m) => {
                  const isActive = m.is_active;
                  return (
                    <tr key={m.key} className={isActive ? 'bg-emerald-50/20' : 'hover:bg-slate-50/60'}>
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {m.architecture}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 tabular-nums">
                        {Number(m.r2_score).toFixed(4)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-700 tabular-nums">
                        {formatSalary(m.mae_inr)}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {m.training_cohort}
                      </td>
                      <td className="py-4 px-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Standby
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {isActive ? (
                          <span className="text-xs font-semibold text-slate-400 italic">
                            Currently Serving
                          </span>
                        ) : (
                          <button
                            onClick={() => handleActivateModel(m.key)}
                            disabled={activatingKey === m.key}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>{activatingKey === m.key ? 'Activating...' : 'Activate Model'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Live Inference Prediction Stream Table */}
        <div className="exec-card overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Live Inference Prediction Stream
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Every calculation run on the public website streams into this audit log
              </p>
            </div>

            {/* Controls: Search, Tier Filter, Export */}
            <div className="flex items-center gap-2 flex-wrap">
              <form onSubmit={handleLogsSearch} className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logsSearch}
                  onChange={(e) => setLogsSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                />
              </form>

              <select
                value={tierFilter}
                onChange={(e) => {
                  setTierFilter(e.target.value);
                  setLogsPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 outline-none"
              >
                <option value="All">All Tiers</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Remote">Remote</option>
              </select>

              <a
                href="/api/admin/logs/export"
                download="salaryai_prediction_logs.csv"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Logs</span>
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-4">Candidate Role</th>
                  <th className="py-3 px-4">Exp (Yrs)</th>
                  <th className="py-3 px-4">Location Tier</th>
                  <th className="py-3 px-4">Predicted Annual CTC</th>
                  <th className="py-3 px-4">Percentile Rank</th>
                  <th className="py-3 px-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No prediction logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5 text-slate-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {log.candidate_role}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700 font-medium">
                        {log.experience_years}y
                      </td>
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                        {log.location_tier}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {formatSalary(log.predicted_ctc)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                          {log.percentile_rank}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {log.verification_tag}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {logs.length} of {logsTotal.toLocaleString()} logged inferences
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                disabled={logsPage <= 1}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-slate-700">
                Page {logsPage} of {logsPages}
              </span>
              <button
                onClick={() => setLogsPage((p) => Math.min(logsPages, p + 1))}
                disabled={logsPage >= logsPages}
                className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
