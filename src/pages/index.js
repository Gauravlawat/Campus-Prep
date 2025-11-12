import Link from 'next/link';
import Head from 'next/head';
import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import ProgressOverviewCard from '@/components/home/ProgressOverviewCard';
import NotificationsPanel from '@/components/home/NotificationsPanel';
import LeaderboardWidget from '@/components/home/LeaderboardWidget';
import QuickActionsGrid from '@/components/home/QuickActionsGrid';
import ActivityFeed from '@/components/home/ActivityFeed';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import {
  Bell, Trophy, Flame, Coins, Grid2X2, Settings, LayoutDashboard, PlayCircle,
  BarChart3, GraduationCap, Code2, CheckCircle2
} from 'lucide-react';
import React from 'react';

const StatCard = ({ icon: Icon, label, value, sublabel, accent = 'text-blue-600', chip }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-5 flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <div className={`h-8 w-8 grid place-items-center rounded-lg bg-blue-50 dark:bg-blue-900/30 ${accent}`}>
        <Icon size={18} />
      </div>
      {chip ? (
        <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          {chip}
        </span>
      ) : null}
    </div>
    <div className="text-3xl font-bold tracking-tight">{value}</div>
    <div className="text-gray-700 font-medium">{label}</div>
    {sublabel ? <div className="text-xs text-emerald-600 font-medium mt-1">{sublabel}</div> : null}
  </div>
);

const ListItem = ({ title, meta, status = 'Solved' }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <div className="font-medium text-gray-900 dark:text-gray-100">{title}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{meta}</div>
    </div>
    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300">
      {status}
    </span>
  </div>
);

export default function HomePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Guest mode: don't redirect; show page with limited data
      setLoading(false);
      return;
    }

    const fetchHomeData = async () => {
      try {
        const [dashboardRes, weeklyStatsRes] = await Promise.all([
          fetch('/api/dashboard/home', { credentials: 'include' }),
          fetch('/api/dashboard/weekly-stats', { credentials: 'include' }),
        ]);

        const dashboardData = await dashboardRes.json();
        const weeklyData = await weeklyStatsRes.json();

        if (dashboardData.success && weeklyData.success) {
          setHomeData({
            userProgress: dashboardData.data.userProgress,
            notifications: dashboardData.data.notifications,
            leaderboard: dashboardData.data.leaderboard,
            quickActions: dashboardData.data.quickActions,
            recentActivity: dashboardData.data.recentActivity,
            weeklyStats: weeklyData.data,
          });
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [user, token, authLoading, router]);

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="p-6">
      <Head>
        <title>Home - College Prep Platform</title>
      </Head>
      <header className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Welcome back — here’s your learning snapshot and next actions.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <input placeholder="Search problems, topics or companies" className="w-64 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <Link href="/problems" className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">All Questions</Link>
              <Link href="/tracks" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md">Browse Tracks</Link>
            </div>
          </div>
        </div>
      </header>
  <main className="max-w-7xl mx-auto space-y-6">
        {/* Top priority actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <QuickActionsGrid actions={homeData?.quickActions} />
            </div>
          </div>
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <LeaderboardWidget leaderboard={homeData?.leaderboard} />
            </div>
          </div>
        </div>

        {/* Progress snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProgressOverviewCard userProgress={homeData?.userProgress} weeklyStats={homeData?.weeklyStats} />
          </div>
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <NotificationsPanel notifications={homeData?.notifications} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <ActivityFeed recentActivity={homeData?.recentActivity} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <NotificationsPanel notifications={homeData?.notifications} />
            </div>
          </div>
        </div>
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard icon={CheckCircle2} label="Problems Solved" value="147" sublabel="+12 this week" />
          <StatCard icon={PlayCircle} label="Average Speed" value="15m 32s" sublabel="-2m faster" accent="text-purple-600" />
          <StatCard icon={BarChart3} label="Success Rate" value="87%" sublabel="+5% improvement" accent="text-emerald-600" />
          <StatCard icon={Flame} label="Streak" value="6 days" sublabel="Keep it up!" accent="text-rose-600" />
        </section>

        {/* Two-column section */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={16} className="text-blue-600" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              <ListItem title="Two Sum" meta="12m • C++ • 2 attempts" />
              <ListItem title="Group Anagrams" meta="18m • Python" />
              <ListItem title="Arrays Sprint" meta="Contest • Rank 42" />
              <ListItem title="Sliding Window Drill" meta="Mock • 45m" />
            </div>
          </div>

          {/* Submissions & Mocks */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={16} className="text-blue-600" />
              <h3 className="font-semibold">Submissions & Mocks</h3>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Mock OA (Amazon 45m)</div>
                  <div className="text-3xl font-bold mt-1">71</div>
                  <div className="text-xs text-gray-500 mt-1">Score</div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-600 text-white">Completed</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  Mock Assessment
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Badges</div>
                <div className="mt-1 flex items-center gap-1.5 text-blue-700">
                  <Trophy size={16} />
                  <span className="font-semibold text-sm">23</span>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Coins</div>
                <div className="mt-1 flex items-center gap-1.5 text-amber-600">
                  <Coins size={16} />
                  <span className="font-semibold text-sm">1,247</span>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs text-gray-500">Streak</div>
                <div className="mt-1 flex items-center gap-1.5 text-rose-600">
                  <Flame size={16} />
                  <span className="font-semibold text-sm">6 days</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-10" />
      </main>
      </div>
    </div>
  );
}

