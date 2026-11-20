import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { Cpu, Play, RotateCw, CheckCircle, Target, Activity } from 'lucide-react';

export default function AdminTraining() {
  const { formatSalary } = useCurrency();
  const [models, setModels] = useState([]);
  const [retraining, setRetraining] = useState(false);
  const [activeModel, setActiveModel] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchTrainingData = () => {
    fetch('/api/admin/models')
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        const active = data.find((m) => m.is_active);
        if (active) setActiveModel(active);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const handleRetrainAll = async () => {
    setRetraining(true);
    setAlert(null);
    try {
      const res = await fetch('/api/admin/models/retrain', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAlert({ type: 'success', message: 'Model pipelines retrained and serialized successfully!' });
      fetchTrainingData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setRetraining(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Model Training & Pipeline Evaluation</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuous cross-validation, hyperparameter tuning, and pipeline artifact serialization
            </p>
          </div>

          <button
            onClick={handleRetrainAll}
            disabled={retraining}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-xs disabled:opacity-50 self-start sm:self-auto"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
            <span>{retraining ? 'Retraining in Progress...' : 'Execute Full Retrain Pipeline'}</span>
          </button>
        </div>

        {alert && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold ${
              alert.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {alert.message}
          </div>
        )}

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {models.map((m) => (
            <div
              key={m.key}
              className={`exec-card p-5 flex flex-col justify-between gap-4 ${
                m.is_active ? 'border-emerald-300 ring-1 ring-emerald-400/40 bg-emerald-50/10' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {m.version}
                  </span>
                  {m.is_active && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ACTIVE LIVE
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{m.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{m.architecture}</p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">R² Accuracy:</span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {Number(m.r2_score).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MAE (₹):</span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatSalary(m.mae_inr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RMSE (₹):</span>
                    <span className="font-semibold text-slate-700 tabular-nums">
                      {formatSalary(m.rmse_inr)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation Split:</span>
                    <span className="text-slate-600 font-medium">{m.training_cohort}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Loss Function: Huber / MSE</span>
                <span className="text-slate-600 font-medium">Scikit-Learn</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
