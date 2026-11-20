import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Database,
  Cpu,
  History,
  Settings,
  ExternalLink,
  Upload,
  LogOut,
  ShieldAlert,
  X
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const menuItems = [
    { name: 'ML Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Dataset Manager', path: '/admin/dataset', icon: Database },
    { name: 'Model Training', path: '/admin/training', icon: Cpu },
    { name: 'Prediction Logs', path: '/admin/logs', icon: History },
    { name: 'Settings & API Keys', path: '/admin/settings', icon: Settings }
  ];

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await fetch('/api/admin/dataset/upload-csv', {
        method: 'POST',
        headers: {
          ...(localStorage.getItem('salaryai_token') ? { Authorization: `Bearer ${localStorage.getItem('salaryai_token')}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadMessage({ type: 'success', text: data.message });
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMessage(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* 1. Left Sidebar (Fixed 240px) */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div>
          {/* Brand & Admin Badge */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                S
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                SalaryAI
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/dashboard');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile Card at Bottom */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/60">
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || 'Aarav Sharma'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                Chief People Analytics
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              title="Sign Out of Admin"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">Admin</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">ML Engine & Benchmark Control</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Live Benchmark status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE BENCHMARK</span>
            </div>

            {/* Upload CSV Dataset Button */}
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Upload CSV Dataset</span>
            </button>

            {/* STRICT ONE-WAY NAV: View Live Website Button (Opens / in new tab) */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Child Pages */}
        <main className="p-6 flex-1">{children}</main>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Upload Benchmark CSV Dataset</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Upload a valid CSV file containing columns: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">candidate_role, experience_years, skill_rank, education_level, location_tier, company_tier, ctc_inr</code>.
            </p>

            {uploadMessage && (
              <div
                className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${
                  uploadMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {uploadMessage.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="mt-4 flex flex-col gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFile || uploading}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {uploading ? 'Ingesting & Retraining...' : 'Upload & Retrain'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
