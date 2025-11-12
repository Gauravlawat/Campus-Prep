import React from 'react';

const NotificationsPanel = ({ notifications }) => {
  const list = notifications || [];
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Notifications</h2>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {list.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up.</p>
        )}
        {list.map((n) => (
          <div key={n.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${n.isImportant ? 'bg-rose-500' : 'bg-blue-500'}`} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
              <span className="ml-auto text-[11px] text-gray-500 dark:text-gray-400">{n.time || ''}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
            {n.actionRequired && (
              <a href={n.actionUrl} className="text-sm text-blue-700 dark:text-blue-300 hover:underline mt-1 inline-block">View details</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;
