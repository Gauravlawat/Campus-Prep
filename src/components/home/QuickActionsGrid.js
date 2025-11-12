import React from 'react';
import { PlayCircle, ClipboardCheck, Users, MessageCircle } from 'lucide-react';

const iconMap = {
  'play-circle': PlayCircle,
  'clipboard-check': ClipboardCheck,
  'users': Users,
  'message-circle': MessageCircle,
};

const QuickActionsGrid = ({ actions }) => {
  const cards = actions?.slice(0, 4) || [
    { title: 'Continue Learning', description: 'Resume where you left off', icon: 'play-circle', actionUrl: '/learning' },
    { title: 'Take Mock Test', description: 'Arrays & Strings assessment', icon: 'clipboard-check', actionUrl: '/assessments/arrays-strings-mock' },
    { title: 'Join Study Group', description: 'Find peers and practice together', icon: 'users', actionUrl: '/community/study-groups' },
    { title: 'Ask a Mentor', description: 'Get guidance from experts', icon: 'message-circle', actionUrl: '/mentorship/book-session' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((action) => {
        const Icon = iconMap[action.icon] || PlayCircle;
        return (
          <a
            key={action.title}
            href={action.actionUrl}
            className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-[#111827] p-5 flex flex-col gap-2 hover:shadow-md transition shadow-blue-500/0 hover:shadow-blue-500/10"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:scale-110 transition" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-blue-50 dark:bg-blue-900/20">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-auto">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-300">Action</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{action.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{action.description}</p>
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:underline">{action.cta || 'Open'} →</span>
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default QuickActionsGrid;
