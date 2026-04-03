'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LanguageChartProps {
  data: { language: string; completed: number; total: number }[];
}

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6'];
const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
  de: 'Deutsch',
};

export default function LanguageChart({ data }: LanguageChartProps) {
  const chartData = data.map((d) => ({
    name: LANGUAGE_LABELS[d.language] || d.language,
    value: d.total,
    completed: d.completed,
  }));

  return (
    <div>
      <div role="img" aria-label="Language distribution pie chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name }) => name}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>Language distribution</caption>
        <thead>
          <tr>
            <th scope="col">Language</th>
            <th scope="col">Completed</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {chartData.map((d) => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>{d.completed}</td>
              <td>{d.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
