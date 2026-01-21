import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ServicesChart: React.FC = () => {
  const { t } = useLanguage();

  const data = [
    { name: t('pestControl'), value: 35, color: 'hsl(152 60% 32%)' },
    { name: t('rodentControl'), value: 25, color: 'hsl(38 92% 50%)' },
    { name: t('termiteControl'), value: 20, color: 'hsl(200 80% 50%)' },
    { name: t('fumigation'), value: 12, color: 'hsl(280 70% 50%)' },
    { name: t('disinfection'), value: 8, color: 'hsl(340 70% 50%)' },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value: number) => [`${value}%`, '']}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => (
              <span className="text-sm text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ServicesChart;
