import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from 'recharts';

export default function BellCurveChart({ userCtc, bellCurveData }) {
  // Fallback bell-curve if not passed
  const defaultCurve = [
    { salary_lacs: 10, density: 5 },
    { salary_lacs: 14, density: 15 },
    { salary_lacs: 18, density: 40 },
    { salary_lacs: 22, density: 75 },
    { salary_lacs: 25.3, density: 92 },
    { salary_lacs: 28, density: 88 },
    { salary_lacs: 32, density: 65 },
    { salary_lacs: 36, density: 42 },
    { salary_lacs: 40.5, density: 25 },
    { salary_lacs: 45, density: 14 },
    { salary_lacs: 50, density: 7 },
    { salary_lacs: 55, density: 3 },
    { salary_lacs: 60, density: 1 }
  ];

  const data = bellCurveData && bellCurveData.length > 0 ? bellCurveData : defaultCurve;
  const userLacs = Number((userCtc / 100000).toFixed(1));

  // Find approximate density at user's salary for the callout pin
  let pinDensity = 25;
  for (let i = 0; i < data.length - 1; i++) {
    if (userLacs >= data[i].salary_lacs && userLacs <= data[i + 1].salary_lacs) {
      pinDensity = (data[i].density + data[i + 1].density) / 2;
      break;
    }
  }

  return (
    <div className="w-full h-48 relative">
      {/* Floating pin badge */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span>Your CTC: ₹{userLacs}L</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="salary_lacs"
            tickFormatter={(val) => `₹${val}L`}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis hide domain={['dataMin', 'dataMax + 10']} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded shadow-md border border-slate-700">
                    <div className="font-semibold">₹{item.salary_lacs} Lacs</div>
                    <div className="text-slate-400 text-[10px]">Benchmark Density: {item.density}</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="density"
            stroke="#0f172a"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#bellGradient)"
          />
          <ReferenceDot
            x={userLacs}
            y={pinDensity}
            r={5}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth={2}
          />
          <ReferenceLine
            x={userLacs}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
