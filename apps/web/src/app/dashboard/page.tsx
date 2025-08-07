import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

async function getDashboardData() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth');
  }

  const profile = await getUserProfile();

  // Get recent browsing sessions (only needed for SSR, real-time will handle the rest)
  const { data: recentSessions } = await supabase
    .from('browsing_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    user,
    profile,
    recentSessions: recentSessions || [],
  };
}

export default async function DashboardPage() {
  const { user, profile, recentSessions } = await getDashboardData();

  return (
    <DashboardClient
      profileName={profile?.full_name}
      recentSessions={recentSessions}
      userEmail={user.email || ''}
      userId={user.id}
    />
  );
}
