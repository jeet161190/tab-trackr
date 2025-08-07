'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface DomainData {
  domain: string;
  timeMs: number;
  percentage: number;
}

interface DomainBreakdownChartProps {
  data: DomainData[];
  className?: string;
  maxSlices?: number;
}

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
};

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      domain: string;
      timeMs: number;
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="font-medium text-gray-900">{data.domain}</p>
        <p className="text-blue-600">Time: {formatTime(data.timeMs)}</p>
        <p className="text-gray-600 text-sm">{data.percentage.toFixed(1)}% of total time</p>
      </div>
    );
  }
  return null;
};

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: LabelProps) => {
  if (!(cx && cy && midAngle && innerRadius && outerRadius && percent) || percent < 0.05) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      dominantBaseline="central"
      fill="white"
      fontSize={12}
      fontWeight="500"
      textAnchor={x > cx ? 'start' : 'end'}
      x={x}
      y={y}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DomainBreakdownChart({
  data,
  className = '',
  maxSlices = 10,
}: DomainBreakdownChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex h-64 items-center justify-center text-gray-500 ${className}`}>
        <div className="text-center">
          <p className="mb-2 text-lg">No domain data available</p>
          <p className="text-sm">Start browsing to see your domain breakdown</p>
        </div>
      </div>
    );
  }

  // Sort by time and limit to maxSlices, group remaining as "Others"
  const sortedData = [...data].sort((a, b) => b.timeMs - a.timeMs);
  const displayData = sortedData.slice(0, maxSlices);

  if (sortedData.length > maxSlices) {
    const othersTime = sortedData.slice(maxSlices).reduce((sum, item) => sum + item.timeMs, 0);

    const totalTime = data.reduce((sum, item) => sum + item.timeMs, 0);

    displayData.push({
      domain: 'Others',
      timeMs: othersTime,
      percentage: (othersTime / totalTime) * 100,
    });
  }

  return (
    <div className={`h-64 w-full ${className}`}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={displayData}
            dataKey="timeMs"
            fill="#8884d8"
            label={CustomLabel}
            labelLine={false}
            outerRadius={80}
          >
            {displayData.map((entry) => (
              <Cell
                fill={COLORS[displayData.indexOf(entry) % COLORS.length]}
                key={`cell-${entry.domain}`}
              />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend
            formatter={(value, entry) => {
              if (entry.payload && typeof entry.payload === 'object' && 'timeMs' in entry.payload) {
                const timeStr = formatTime(entry.payload.timeMs as number);
                return `${value} (${timeStr})`;
              }
              return value;
            }}
            height={36}
            iconType="circle"
            verticalAlign="bottom"
            wrapperStyle={{
              fontSize: '12px',
              paddingTop: '10px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
