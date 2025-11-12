import React from 'react';

const AchievementsBadges = ({ achievements, showAll = false }) => {
  const achievementsToShow = showAll ? achievements : achievements?.slice(0, 6);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Achievements</h2>
      <div className="grid grid-cols-3 gap-4">
        {achievementsToShow?.map((achievement) => (
          <div key={achievement.achievementId} className="flex flex-col items-center text-center">
            <img src={achievement.badgeIcon} alt={achievement.title} className="w-16 h-16" />
            <p className="font-bold mt-2">{achievement.title}</p>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            {!achievement.isUnlocked && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${achievement.progress}%` }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsBadges;
