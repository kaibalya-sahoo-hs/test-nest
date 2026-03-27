import React from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { RechartsDevtools } from '@recharts/devtools';

function Charts({data}) {
  return (
    <div className='bg-white rounded-lg p-8'>
      <div className='pb-8 text-xl font-bold'>
        <h1>Sales details</h1>
      </div>
     <LineChart
      style={{ width: '100%', maxWidth: '1000px', height: '100%', maxHeight: '60vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#bfbfbf" vertical={false}/>
      <XAxis dataKey="name" stroke="#666666" />
      <YAxis width="auto" stroke="#666666" />
      <Tooltip
        cursor={{
          stroke: 'white',
        }}
        contentStyle={{
          backgroundColor: 'white',
          borderColor: 'var(--color-border-2)',
          paddingBottom: 0,
          width: 'fit-content',
        }}
      />
      <Legend />
      <Line
        dataKey="pv"
        stroke="#1d16f5"
        dot={{
          fill: '#1d16f5',
        }}
        activeDot={{ r: 8, stroke: 'var(--color-surface-base)' }}
      />
      <RechartsDevtools />
    </LineChart>
    </div>
  )
}

export default Charts