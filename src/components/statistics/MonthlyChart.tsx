'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyChartProps {
  data: { date: string; completed: number; total: number }[];
}

export default function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <div>
      <div role="img" aria-label="Monthly progress line chart">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#2563eb"
              strokeWidth={2}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#9ca3af"
              strokeWidth={2}
              name="Total"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>Monthly progress</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Completed</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{d.completed}</td>
              <td>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
