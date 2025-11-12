import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TracksFilter from '@/components/tracks/TracksFilter';
import TrackCard from '@/components/tracks/TrackCard';
import EnrolledTracksSection from '@/components/tracks/EnrolledTracksSection';
import Navbar from '@/components/layout/Navbar';
import { Layers, Compass, Filter, Rocket } from 'lucide-react';

export default function TracksPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [enrolledTracks, setEnrolledTracks] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    year: 'all',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`/api/tracks?${queryParams.toString()}`);
        const data = await response.json();
        if (data.success) {
          setTracks(data.data.tracks);
          setCategories(data.data.categories);
          setDifficulties(data.data.difficulties);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [filters]);

  useEffect(() => {
    const fetchEnrolledTracks = async () => {
        if (!user) return;
        // This is a placeholder for fetching enrolled tracks
        // In a real application, you would have an endpoint to get enrolled tracks for the user
    };
    fetchEnrolledTracks();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <div className="p-6">
        <Head>
          <title>Learning Tracks - College Prep Platform</title>
        </Head>
        <header className="max-w-7xl mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-blue-600" />
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Browse Learning Tracks
                  </h1>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Structured paths to master DSA, ML, Development and more.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/" className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Home</Link>
                <Link href="/problems" className="text-sm font-medium text-gray-700 dark:text-gray-200 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">All Questions</Link>
                <Link href="#tracks" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2">
                  <Compass size={16} /> Explore
                </Link>
              </div>
            </div>
            <div className="mt-4">
              <TracksFilter
                onFilterChange={setFilters}
                currentFilters={filters}
                categories={categories}
                difficulties={difficulties}
              />
            </div>
          </div>
        </header>

        <main id="tracks" className="max-w-7xl mx-auto space-y-6">
          {enrolledTracks && enrolledTracks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Your Learning Paths</h2>
                <Link href="/profile" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Rocket size={14} /> View progress
                </Link>
              </div>
              <EnrolledTracksSection enrolledTracks={enrolledTracks} />
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="h-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse"
                    />
                  ))
              : tracks.map((track) => (
                  <TrackCard key={track.trackId} track={track} userProgress={null} />
                ))}
          </section>
        </main>
      </div>
    </div>
  );
}
