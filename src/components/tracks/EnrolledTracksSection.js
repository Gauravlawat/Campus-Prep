import React from 'react';
import TrackCard from './TrackCard';

const EnrolledTracksSection = ({ enrolledTracks }) => {
  if (!enrolledTracks || enrolledTracks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Your Learning Paths</h2>
      <div className="flex overflow-x-auto space-x-6 pb-4">
        {enrolledTracks.map(({ track, userProgress }) => (
          <div key={track.trackId} className="flex-shrink-0 w-80">
            <TrackCard track={track} userProgress={userProgress} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrolledTracksSection;
