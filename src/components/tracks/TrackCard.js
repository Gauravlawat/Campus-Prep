import React from 'react';
import Link from 'next/link';
import { Clock, Layers } from 'lucide-react';

const TrackCard = ({ track, userProgress }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition">
      <div className="h-36 w-full bg-gradient-to-tr from-blue-600/10 to-blue-600/5 dark:from-blue-400/10 dark:to-blue-400/5 flex items-end">
        {/* Optional thumbnail placeholder */}
        {track.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="p-3 text-blue-700 flex items-center gap-2">
            <Layers size={18} />
            <span className="text-xs">Learning Track</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-1">{track.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{track.description}</p>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300">
            {track.difficulty}
          </span>
          <span className="flex items-center gap-1"><Clock size={14} /> {track.estimatedDuration || 30} days</span>
        </div>

        {userProgress ? (
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${userProgress.overallProgress}%` }} />
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
              <span>{userProgress.overallProgress}% complete</span>
              <Link href={`/tracks/${track.trackId}`} className="text-blue-600 hover:underline">
                Continue
              </Link>
            </div>
          </div>
        ) : (
          <Link href={`/tracks/${track.trackId}`} className="mt-4 inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded-md">
            View Track
          </Link>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
