'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyChartProps {
  data: { date: string; completed: number; total: number }[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }));

  return (
    <div>
      <div role="img" aria-label="Weekly progress bar chart" aria-hidden="false">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="completed" fill="#2563eb" name="Completed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="total" fill="#e5e7eb" name="Total" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Accessible data table for screen readers */}
      <table className="sr-only">
        <caption>Weekly progress</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Completed</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {formatted.map((d) => (
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
