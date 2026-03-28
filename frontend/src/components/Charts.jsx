import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#4880FF',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(72,128,255,0.3)',
          border: 'none',
        }}
      >
        {Number(payload[0].value).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
    );
  }
  return null;
};

function Charts({ data }) {
  const [selectedMonth, setSelectedMonth] = useState('October');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calculate max value for percentage axis scaling
  const maxValue = Math.max(...data.map((d) => d.pv));

  // Format Y-axis as percentages
  const formatYAxis = (value) => {
    const pct = Math.round((value / maxValue) * 100);
    return `${pct}%`;
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '28px 28px 16px 28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#202224',
            margin: 0,
          }}
        >
          Sales Details
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '6px 28px 6px 12px',
            fontSize: '13px',
            color: '#888',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'auto',
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4880FF" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#4880FF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="0"
            stroke="#f0f0f0"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#b0b0b0', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#b0b0b0', fontSize: 12 }}
            tickFormatter={formatYAxis}
            domain={[0, maxValue]}
            ticks={[
              0,
              maxValue * 0.2,
              maxValue * 0.4,
              maxValue * 0.6,
              maxValue * 0.8,
              maxValue,
            ]}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: '#4880FF',
              strokeWidth: 1,
              strokeDasharray: '4 4',
            }}
          />
          <Area
            dataKey="pv"
            stroke="#4880FF"
            strokeWidth={2.5}
            fill="url(#salesGradient)"
            dot={{
              r: 3,
              fill: '#4880FF',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Charts;