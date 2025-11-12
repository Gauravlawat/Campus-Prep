import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsOverview from '@/components/profile/StatsOverview';
import AchievementsBadges from '@/components/profile/AchievementsBadges';
import PerformanceCharts from '@/components/profile/PerformanceCharts';
import ActivityTimeline from '@/components/profile/ActivityTimeline';
import LearningJourney from '@/components/profile/LearningJourney';

// Local small components
const LogoutButton = () => {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className="inline-flex items-center h-10 px-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      Logout
    </button>
  );
};

const LogoutPanel = () => {
  const { logout } = useAuth();
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Session</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">Manage your account session</p>
      </div>
      <button
        onClick={logout}
        className="inline-flex items-center h-9 px-3 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { userId } = router.query;
  const [profileData, setProfileData] = useState(null);
  const [achievementsData, setAchievementsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    const fetchProfileData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileRes, achievementsRes] = await Promise.all([
          fetch(`/api/profile/${userId}`, { credentials: 'include' }),
          fetch(`/api/profile/${userId}/achievements`, { credentials: 'include' }),
        ]);

        const profileData = await profileRes.json();
        const achievementsData = await achievementsRes.json();

        if (profileData.success) {
          setProfileData(profileData.data);
        }
        if (achievementsData.success) {
          setAchievementsData(achievementsData.data);
        }
  setIsOwnProfile((user.id || user._id) === userId);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user, authLoading, router]);

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center text-gray-500">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <Head>
        <title>{profileData?.profile?.basicInfo?.firstName}'s Profile - College Prep Platform</title>
      </Head>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-start justify-between gap-4">
          <ProfileHeader profile={profileData?.profile} isOwnProfile={isOwnProfile} />
          {isOwnProfile && <LogoutButton />}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {['overview', 'achievements', 'analytics', 'activity', 'journey'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-2 border-b-2 capitalize ${
                  activeTab === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <StatsOverview stats={profileData?.profile} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <PerformanceCharts analytics={profileData?.profile?.problemSolvingStats} />
              </div>
            </div>
            <div className="space-y-6">
              {isOwnProfile && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                  <LogoutPanel />
                </div>
              )}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <AchievementsBadges achievements={achievementsData?.achievements} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                <ActivityTimeline recentActivity={profileData?.profile?.recentActivity} />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <AchievementsBadges achievements={achievementsData?.achievements} showAll />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <PerformanceCharts analytics={profileData?.profile?.problemSolvingStats} />
          </div>
        )}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <ActivityTimeline recentActivity={profileData?.profile?.recentActivity} showAll />
          </div>
        )}
        {activeTab === 'journey' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <LearningJourney tracks={profileData?.profile?.learningJourney} milestones={profileData?.profile?.learningJourney?.milestones} />
          </div>
        )}
      </div>
    </div>
  );
}
