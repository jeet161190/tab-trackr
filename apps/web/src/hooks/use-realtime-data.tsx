'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DomainData, TimeUsageData } from '@/components/charts';
import { createClient } from '@/lib/supabase/client';

interface RealtimeDataState {
  timeUsageData: TimeUsageData[];
  domainData: DomainData[];
  todayStats: {
    total_time_ms: number;
    session_count: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

export function useRealtimeData(userId: string | undefined) {
  const [state, setState] = useState<RealtimeDataState>({
    timeUsageData: [],
    domainData: [],
    todayStats: null,
    isLoading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const today = new Date().toISOString().split('T')[0];

      // Fetch all data in parallel
      const [weeklyStatsResult, domainStatsResult, todayStatsResult] = await Promise.all([
        // Get weekly stats for chart
        supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', userId)
          .gte('date', weekAgo.toISOString().split('T')[0])
          .order('date', { ascending: true }),

        // Get domain breakdown
        supabase
          .from('browsing_sessions')
          .select('domain, duration_ms')
          .eq('user_id', userId)
          .gte('created_at', weekAgo.toISOString()),

        // Get today's stats
        supabase
          .from('daily_stats')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single(),
      ]);

      // Process time usage data
      const timeUsageData: TimeUsageData[] = (weeklyStatsResult.data || []).map((day) => ({
        date: day.date,
        timeMs: day.total_time_ms,
        sessionCount: day.session_count,
      }));

      // Process domain data
      const domainMap = new Map<string, number>();
      let totalTime = 0;

      if (domainStatsResult.data) {
        for (const session of domainStatsResult.data) {
          const currentTime = domainMap.get(session.domain) || 0;
          domainMap.set(session.domain, currentTime + session.duration_ms);
          totalTime += session.duration_ms;
        }
      }

      const domainData: DomainData[] = Array.from(domainMap.entries())
        .map(([domain, timeMs]) => ({
          domain,
          timeMs,
          percentage: totalTime > 0 ? (timeMs / totalTime) * 100 : 0,
        }))
        .sort((a, b) => b.timeMs - a.timeMs);

      setState({
        timeUsageData,
        domainData,
        todayStats: todayStatsResult.data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching realtime data:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch data. Please try again.',
      }));
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // Initial fetch
    fetchData();

    // Set up real-time subscriptions
    const dailyStatsChannel = supabase
      .channel('daily_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log('Daily stats changed, refetching data...');
          fetchData();
        }
      )
      .subscribe();

    const browssingSessionsChannel = supabase
      .channel('browsing_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'browsing_sessions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          console.log('Browsing sessions changed, refetching data...');
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(dailyStatsChannel);
      supabase.removeChannel(browssingSessionsChannel);
    };
  }, [
    userId,
    supabase, // Initial fetch
    fetchData,
  ]);

  return state;
}
