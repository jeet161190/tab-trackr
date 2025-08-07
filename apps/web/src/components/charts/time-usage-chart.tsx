'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface TimeUsageData {
  date: string;
  timeMs: number;
  sessionCount: number;
}

interface TimeUsageChartProps {
  data: TimeUsageData[];
  period: 'daily' | 'weekly' | 'monthly';
  className?: string;
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

const formatDate = (dateString: string, period: 'daily' | 'weekly' | 'monthly'): string => {
  const date = new Date(dateString);

  switch (period) {
    case 'daily':
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    case 'weekly':
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    case 'monthly':
      return date.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      });
    default:
      return dateString;
  }
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      timeMs: number;
      sessionCount: number;
    };
  }>;
  label?: string | number;
  period: 'daily' | 'weekly' | 'monthly';
}

const CustomTooltip = ({ active, payload, label, period }: TooltipProps) => {
  if (active && payload && payload.length && label) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="font-medium text-gray-900">{formatDate(String(label), period)}</p>
        <p className="text-blue-600">Time: {formatTime(data.timeMs)}</p>
        <p className="text-gray-600 text-sm">
          {data.sessionCount} session{data.sessionCount !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

export function TimeUsageChart({ data, period, className = '' }: TimeUsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex h-64 items-center justify-center text-gray-500 ${className}`}>
        <div className="text-center">
          <p className="mb-2 text-lg">No data available</p>
          <p className="text-sm">Start using TabTrackr to see your browsing patterns</p>
        </div>
      </div>
    );
  }

  const maxTimeMs = Math.max(...data.map((d) => d.timeMs));
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: formatDate(d.date, period),
  }));

  return (
    <div className={`h-64 w-full ${className}`}>
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="timeGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid className="opacity-30" strokeDasharray="3 3" />
          <XAxis
            axisLine={false}
            dataKey="displayDate"
            interval={period === 'daily' ? 1 : 0}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[0, maxTimeMs * 1.1]}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={formatTime}
            tickLine={false}
          />
          <Tooltip content={(props) => <CustomTooltip {...props} period={period} />} />
          <Area
            dataKey="timeMs"
            fill="url(#timeGradient)"
            fillOpacity={1}
            stroke="#3B82F6"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
