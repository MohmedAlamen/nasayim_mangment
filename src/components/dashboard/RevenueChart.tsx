import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart: React.FC = () => {
  const { dir } = useLanguage();

  const data = [
    { name: dir === 'rtl' ? 'يناير' : 'Jan', value: 4000 },
    { name: dir === 'rtl' ? 'فبراير' : 'Feb', value: 3000 },
    { name: dir === 'rtl' ? 'مارس' : 'Mar', value: 5000 },
    { name: dir === 'rtl' ? 'أبريل' : 'Apr', value: 4500 },
    { name: dir === 'rtl' ? 'مايو' : 'May', value: 6000 },
    { name: dir === 'rtl' ? 'يونيو' : 'Jun', value: 5500 },
    { name: dir === 'rtl' ? 'يوليو' : 'Jul', value: 7000 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(152 60% 32%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(152 60% 32%)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            reversed={dir === 'rtl'}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            orientation={dir === 'rtl' ? 'right' : 'left'}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(152 60% 32%)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
