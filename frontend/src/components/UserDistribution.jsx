import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const UserDistribution = ({ guests, admins, members }) => {
  // Prepare data for the chart
  const data = [
    { name: 'Guests', value: guests.length },
    { name: 'Admins', value: admins.length },
    { name: 'Members', value: members.length },
  ];

  // Custom Hex Colors for your palette
  const COLORS = [
    '#6366f1', // Indigo (Guests)
    '#1e293b', // Slate (Admins)
    '#10b981', // Emerald (Members)
  ];

  return (
    <div className="bg-white p-8 w-1/2 shadow-sm flex flex-col h-[400px]">
      <div className="mb-2">
        <h3 className="text-[#1e293b] font-bold text-lg tracking-tight">User Composition</h3>
        <p className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest">Database Segmentation</p>
      </div>

      <div className="relative flex-grow">
        {/* Central Total Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#1e293b]">
            {guests.length + admins.length + members.length}
          </span>
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase">Total</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70} // Creates the donut hole
              outerRadius={90}
              paddingAngle={8} // Space between segments
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="outline-none"
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: '600'
              }} 
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-xs font-bold text-[#64748b] uppercase ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserDistribution;