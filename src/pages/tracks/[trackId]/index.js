import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import TrackGraph from '@/components/tracks/TrackGraph';
import Link from 'next/link';
import { Layers, Clock, Target, UserPlus, PlayCircle, Bookmark, Star } from 'lucide-react';

export default function TrackDetailPage() {
  const router = useRouter();
  const { trackId } = router.query;
  const { user, token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!trackId) return;
    const fetchTrack = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tracks/${trackId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.success) {
          setTrack(data.data.track);
          setUserProgress(data.data.userProgress);
        }
      } catch (e) {
        console.error('Error fetching track', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
  }, [trackId, token]);

  useEffect(() => {
    if (!trackId) return;
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/tracks/${trackId}/progress`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.success) setMetrics(data.data);
      } catch (e) {
        console.error('Error fetching metrics', e);
      }
    };
    fetchMetrics();
  }, [trackId, token]);

  const progressByTopic = useMemo(() => {
    const map = {};
    if (!userProgress?.topicProgress) return map;
    for (const t of userProgress.topicProgress) {
      const total = t.subtopicProgress?.length || 0;
      const done = t.subtopicProgress?.filter(s => s.isCompleted)?.length || 0;
      map[t.topicId] = total > 0 ? Math.round((done / total) * 100) : 0;
    }
    return map;
  }, [userProgress]);

  const primaryAction = () => {
    if (!track) return null;
    const firstTopic = track.topics?.sort((a,b) => (a.order||0)-(b.order||0))[0];
    const label = userProgress ? 'Continue Learning' : 'Enroll & Start';
    const Icon = userProgress ? PlayCircle : UserPlus;
    const onClick = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      if (userProgress) {
        if (firstTopic) router.push(`/tracks/${track.trackId}/learn/${firstTopic.topicId}`);
        return;
      }
      try {
        setEnrolling(true);
        const res = await fetch(`/api/tracks/${track.trackId}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            studySchedule: { dailyTime: 60, problemsPerDay: 2 },
            goals: { targetCompletionDays: track.estimatedDuration || 30 },
          }),
        });
        const data = await res.json();
        if (data.success) {
          router.push(`/tracks/${track.trackId}/learn/${data.data.firstTopic}`);
        }
      } catch (e) {
        console.error('Enroll error', e);
      } finally {
        setEnrolling(false);
      }
    };
    return (
      <button onClick={onClick} disabled={enrolling} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm px-4 py-2 rounded-md">
        <Icon size={16} /> {label}
      </button>
    );
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center text-gray-500">Loading…</div>;
  if (!track) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center text-gray-500">Track not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <Head>
        <title>{track.title} - Track</title>
      </Head>
      <div className="p-6">
        <header className="max-w-7xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-blue-600">
                  <Layers size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Track</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 truncate">{track.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{track.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-900/20 dark:text-violet-300">{track.category}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300">{track.difficulty}</span>
                  {track.tags?.slice(0,3).map((t) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-900/40 dark:text-gray-300">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/tracks" className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">All Tracks</Link>
                {primaryAction()}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Estimated" value={`${track.estimatedDuration || 30} days`} icon={Clock} />
              <Stat label="Topics" value={`${track.topics?.length || 0}`} icon={Target} />
              <Stat label="Enrolled" value={`${track.enrollmentCount || 0}`} icon={Bookmark} />
              <Stat label="Rating" value={`${track.averageRating || 4.8}`} icon={Star} />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto space-y-6">
          <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Learning Map</h2>
              <span className="text-xs text-gray-500">Scroll horizontally to explore</span>
            </div>
            <TrackGraph
              track={track}
              currentTopicId={userProgress?.currentTopic}
              progressByTopic={progressByTopic}
              metricsByTopic={metrics?.topicMetrics || {}}
            />
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold mb-3">About this track</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{track.description}</p>
          </section>
        </main>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/30">
      <div className="flex items-center gap-2 text-blue-600">
        <Icon size={16} />
        <div className="text-xs text-gray-600 dark:text-gray-300">{label}</div>
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
