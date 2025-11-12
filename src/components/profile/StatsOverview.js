import React from 'react';

const StatsOverview = ({ stats }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Statistics Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Problems Solved</p>
          <p className="text-2xl font-bold">{stats?.totalProblems?.solved || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Accuracy</p>
          <p className="text-2xl font-bold">{stats?.totalProblems?.accuracyRate?.toFixed(1) || 0}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Global Rank</p>
          <p className="text-2xl font-bold">#{stats?.rankings?.globalRank || 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">College Rank</p>
          <p className="text-2xl font-bold">#{stats?.rankings?.collegeRank || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
