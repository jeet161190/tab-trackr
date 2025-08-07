import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-6 font-bold text-5xl text-gray-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TabTrackr
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-gray-600 text-xl">
            Track your browsing habits, boost your productivity, and gain insights into your digital
            life
          </p>

          <div className="flex justify-center space-x-4">
            <Button asChild className="px-8" size="lg">
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button asChild className="px-8" size="lg" variant="outline">
              <Link href="/install">Install Extension</Link>
            </Button>
          </div>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Track Time</title>
                <path
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Track Time</h3>
            <p className="text-gray-600">
              Automatically track time spent on websites and applications
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Analyze Patterns</title>
                <path
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Analyze Patterns</h3>
            <p className="text-gray-600">
              Get detailed insights and analytics about your browsing habits
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <svg
                className="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title>Team Insights</title>
                <path
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-semibold text-lg">Team Insights</h3>
            <p className="text-gray-600">
              Share productivity insights with your team and collaborate
            </p>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-4 font-bold text-2xl">Ready to boost your productivity?</h2>
          <p className="mb-6 opacity-90">
            Join thousands of users who have improved their digital habits with TabTrackr
          </p>
          <Button asChild className="px-8" size="lg" variant="secondary">
            <Link href="/auth">Sign Up Free</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
