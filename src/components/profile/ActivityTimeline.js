import React from 'react';

const ActivityTimeline = ({ recentActivity, showAll = false }) => {
  const activitiesToShow = showAll ? recentActivity : recentActivity?.slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Activity Timeline</h2>
      <div className="space-y-4">
        {activitiesToShow?.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5"></div>
            <div>
              <p className="font-bold">{activity.title}</p>
              <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
