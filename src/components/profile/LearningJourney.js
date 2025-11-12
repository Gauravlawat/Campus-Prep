import React from 'react';

const LearningJourney = ({ tracks, milestones }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Learning Journey</h2>
      <div>
        <h3 className="font-bold mb-2">Enrolled Tracks</h3>
        <div className="space-y-2">
          {tracks?.tracksEnrolled?.map((track) => (
            <div key={track.trackId}>
              <p className="font-bold">{track.title}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${track.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="font-bold mb-2">Milestones</h3>
        <div className="space-y-2">
          {milestones?.map((milestone) => (
            <div key={milestone.milestoneId} className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
              <div>
                <p className="font-bold">{milestone.title}</p>
                <p className="text-sm text-gray-600">Achieved on {new Date(milestone.achievedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningJourney;
