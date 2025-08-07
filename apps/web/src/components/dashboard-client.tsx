'use client';

import Link from 'next/link';
import { DomainBreakdownChart, TimeUsageChart } from '@/components/charts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRealtimeData } from '@/hooks/use-realtime-data';

interface DashboardClientProps {
  userId: string;
  userEmail: string;
  profileName?: string | null;
  recentSessions: Array<{
    id: string;
    domain: string;
    title: string;
    duration_ms: number;
    start_time: string;
  }>;
}

function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function DashboardClient({
  userId,
  userEmail,
  profileName,
  recentSessions,
}: DashboardClientProps) {
  const { timeUsageData, domainData, todayStats, isLoading, error } = useRealtimeData(userId);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="p-6 text-center">
          <h2 className="mb-4 font-semibold text-gray-900 text-xl">Error Loading Dashboard</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  // Calculate weekly stats from time usage data
  const totalWeeklyTime = timeUsageData.reduce((acc, day) => acc + day.timeMs, 0);
  const avgDailyTime = timeUsageData.length > 0 ? totalWeeklyTime / timeUsageData.length : 0;
  const totalWeeklySessions = timeUsageData.reduce((acc, day) => acc + day.sessionCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="font-bold text-2xl text-gray-900">TabTrackr Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {profileName || userEmail}
                {isLoading && <span className="ml-2 text-blue-600">(Updating...)</span>}
              </p>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/settings">Settings</Link>
              </Button>
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="outline">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="mb-2 font-medium text-gray-900 text-lg">Today's Activity</h3>
            <p className="font-bold text-3xl text-blue-600">
              {todayStats ? formatTime(todayStats.total_time_ms) : '0m'}
            </p>
            <p className="mt-1 text-gray-600 text-sm">
              {todayStats ? `${todayStats.session_count} sessions` : 'No activity yet'}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-medium text-gray-900 text-lg">Weekly Average</h3>
            <p className="font-bold text-3xl text-green-600">{formatTime(avgDailyTime)}</p>
            <p className="mt-1 text-gray-600 text-sm">per day</p>
          </Card>

          <Card className="p-6">
            <h3 className="mb-2 font-medium text-gray-900 text-lg">Total This Week</h3>
            <p className="font-bold text-3xl text-purple-600">{formatTime(totalWeeklyTime)}</p>
            <p className="mt-1 text-gray-600 text-sm">{totalWeeklySessions} sessions</p>
          </Card>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-medium text-gray-900 text-lg">Weekly Usage Trend</h3>
            <TimeUsageChart data={timeUsageData} period="weekly" />
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-medium text-gray-900 text-lg">Domain Breakdown</h3>
            <DomainBreakdownChart data={domainData} maxSlices={8} />
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-medium text-gray-900 text-lg">Recent Activity</h3>
            {recentSessions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-gray-500">No browsing data yet</p>
                <p className="text-gray-400 text-sm">
                  Install the browser extension to start tracking your browsing habits
                </p>
                <Button asChild className="mt-4">
                  <Link href="/install">Install Extension</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session) => (
                  <div
                    className="flex items-center justify-between border-gray-100 border-b py-2"
                    key={session.id}
                  >
                    <div>
                      <p className="font-medium text-sm">{session.domain}</p>
                      <p className="text-gray-500 text-xs">{session.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatTime(session.duration_ms)}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(session.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-medium text-gray-900 text-lg">Daily Summary</h3>
            {timeUsageData.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No data for the past week</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeUsageData.slice(-7).map((day) => (
                  <div className="flex items-center justify-between" key={day.date}>
                    <span className="text-gray-600 text-sm">
                      {new Date(day.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{formatTime(day.timeMs)}</span>
                      <div className="h-2 w-20 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.min(100, (day.timeMs / Math.max(...timeUsageData.map((d) => d.timeMs))) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
