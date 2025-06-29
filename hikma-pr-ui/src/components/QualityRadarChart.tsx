
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface QualityRadarChartProps {
  quality: {
    security: number;
    performance: number;
    maintainability: number;
    standards: number;
  };
}

const QualityRadarChart = ({ quality }: QualityRadarChartProps) => {
  const data = [
    { name: 'Security', value: quality.security, color: '#ef4444' },
    { name: 'Performance', value: quality.performance, color: '#f97316' },
    { name: 'Maintainability', value: quality.maintainability, color: '#eab308' },
    { name: 'Standards', value: quality.standards, color: '#22c55e' }
  ];

  const barData = data.map(item => ({
    ...item,
    fullValue: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Bar Chart Visualization */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Score']}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
            </div>
            <span className="text-lg font-bold text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QualityRadarChart;
