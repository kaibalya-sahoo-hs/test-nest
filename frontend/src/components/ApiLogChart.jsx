import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

const ApiLogChart = ({ logData }) => {
  // Theme Colors
  const colors = {
    primary: '#6366f1', // Indigo
    danger: '#ef4444',  // Red
    grid: '#e2e8f0',
    text: '#94a3b8'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm h-[350px] w-full">
      <div className="mb-6">
        <h3 className="text-[#1e293b] font-bold text-lg">Traffic Overview</h3>
        <p className="text-[10px] w-fit font-black text-[#6366f1] bg-[#eef2ff] px-2 py-1 rounded-md">States of traffic per hour</p>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={logData}>
          <defs>
            <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
          
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: colors.text, fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: colors.text, fontSize: 12, fontWeight: 600 }}
          />

          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              padding: '12px' 
            }} 
          />

          <Area 
            type="monotone" 
            dataKey="requests" 
            stroke={colors.primary} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorReq)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ApiLogChart;