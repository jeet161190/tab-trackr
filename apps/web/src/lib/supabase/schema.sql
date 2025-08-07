-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS
FROM PUBLIC;
-- Create profiles table for user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Create browsing_sessions table for tracking data
CREATE TABLE browsing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER DEFAULT 0,
  date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Create daily_stats table for aggregated daily data
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_time_ms INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  top_domains JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);
-- Create weekly_stats table for aggregated weekly data
CREATE TABLE weekly_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  total_time_ms INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  daily_breakdown JSONB DEFAULT '{}',
  top_domains JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, week_start)
);
-- Create teams table for team collaboration
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Create team_members table for team membership
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(team_id, user_id)
);
-- Create user_preferences table for settings
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tracking_enabled BOOLEAN DEFAULT true,
  privacy_mode BOOLEAN DEFAULT false,
  data_retention_days INTEGER DEFAULT 90,
  website_blacklist TEXT [] DEFAULT ARRAY []::TEXT [],
  website_whitelist TEXT [] DEFAULT ARRAY []::TEXT [],
  notifications_enabled BOOLEAN DEFAULT true,
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
-- Create indexes for better performance
CREATE INDEX idx_browsing_sessions_user_id ON browsing_sessions(user_id);
CREATE INDEX idx_browsing_sessions_date ON browsing_sessions(date);
CREATE INDEX idx_browsing_sessions_domain ON browsing_sessions(domain);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX idx_weekly_stats_user_week ON weekly_stats(user_id, week_start DESC);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
-- Row Level Security policies
-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT WITH CHECK (auth.uid() = id);
-- Browsing sessions policies
ALTER TABLE browsing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own browsing sessions" ON browsing_sessions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own browsing sessions" ON browsing_sessions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own browsing sessions" ON browsing_sessions FOR
UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own browsing sessions" ON browsing_sessions FOR DELETE USING (auth.uid() = user_id);
-- Daily stats policies
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily stats" ON daily_stats FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily stats" ON daily_stats FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily stats" ON daily_stats FOR
UPDATE USING (auth.uid() = user_id);
-- Weekly stats policies
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own weekly stats" ON weekly_stats FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekly stats" ON weekly_stats FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own weekly stats" ON weekly_stats FOR
UPDATE USING (auth.uid() = user_id);
-- User preferences policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON user_preferences FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR
UPDATE USING (auth.uid() = user_id);
-- Team policies (more complex, allowing team members to view each other)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view their teams" ON teams FOR
SELECT USING (
    id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Team owners can update their teams" ON teams FOR
UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can create teams" ON teams FOR
INSERT WITH CHECK (auth.uid() = owner_id);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view team membership" ON team_members FOR
SELECT USING (
    team_id IN (
      SELECT team_id
      FROM team_members
      WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Team owners and admins can manage members" ON team_members FOR ALL USING (
  team_id IN (
    SELECT team_id
    FROM team_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);
-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_browsing_sessions_updated_at BEFORE
UPDATE ON browsing_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_stats_updated_at BEFORE
UPDATE ON daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_stats_updated_at BEFORE
UPDATE ON weekly_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE
UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE
UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, email, full_name, avatar_url)
VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  );
INSERT INTO public.user_preferences (user_id)
VALUES (NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();