import React from 'react';

const ActivityFeed = ({ recentActivity }) => {
  const items = recentActivity || [];
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Activity Feed</h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {items.map((activity, index) => (
          <div key={index} className="py-3 flex items-start gap-3">
            <span className="h-2 w-2 rounded-full bg-gray-400 mt-2" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.title}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
