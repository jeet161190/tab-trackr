// Re-export the database types from the web app
// In a real setup, these would be shared or generated from the same source

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      browsing_sessions: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          domain: string;
          title: string | null;
          start_time: string;
          end_time: string | null;
          duration_ms: number;
          date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          domain: string;
          title?: string | null;
          start_time: string;
          end_time?: string | null;
          duration_ms?: number;
          date: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          domain?: string;
          title?: string | null;
          start_time?: string;
          end_time?: string | null;
          duration_ms?: number;
          date?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_time_ms: number;
          session_count: number;
          top_domains: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_time_ms?: number;
          session_count?: number;
          top_domains?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_time_ms?: number;
          session_count?: number;
          top_domains?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Extension-specific types (existing)
export interface TabSession {
  url: string;
  domain: string;
  title: string;
  startTime: number;
  lastActive: number;
  totalTime: number;
  isActive: boolean;
}

export interface DailyStats {
  date: string;
  domains: Record<string, number>;
  totalTime: number;
  sessions: TabSession[];
}

export interface WeeklyStats {
  weekStart: string;
  totalTime: number;
  dailyBreakdown: Record<string, number>;
  topDomains: Record<string, number>;
  sessionCount: number;
}
