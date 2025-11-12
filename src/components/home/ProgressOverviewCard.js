import React from 'react';
import { Flame, Coins, CheckCircle2 } from 'lucide-react';

const chip = (Icon, label, value, color) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
    <div className={`h-9 w-9 grid place-items-center rounded-md ${color.bg}`}>
      <Icon className={`h-5 w-5 ${color.fg}`} />
    </div>
    <div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
      <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
  </div>
);

const ProgressOverviewCard = ({ userProgress, weeklyStats }) => {
  const sprint = userProgress?.currentSprint;
  const pct = Math.min(100, Math.max(0, sprint?.completionPercentage || 0));
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Progress Overview</h2>
        <a href="/tracks" className="text-sm text-blue-700 dark:text-blue-300 hover:underline">Go to sprint</a>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">{sprint?.trackTitle || 'Current Sprint'}</div>
          <div className="text-gray-900 dark:text-gray-100 font-medium">{pct}%</div>
        </div>
        <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {chip(Flame, 'Streak', `${userProgress?.dailyStreak || 0} days`, { bg: 'bg-rose-50 dark:bg-rose-900/20', fg: 'text-rose-600 dark:text-rose-400' })}
          {chip(Coins, 'Credits', `${userProgress?.totalCredits || 0}`, { bg: 'bg-amber-50 dark:bg-amber-900/20', fg: 'text-amber-600 dark:text-amber-400' })}
          {chip(CheckCircle2, 'Solved', `${weeklyStats?.problemsSolved || 0}`, { bg: 'bg-emerald-50 dark:bg-emerald-900/20', fg: 'text-emerald-600 dark:text-emerald-400' })}
        </div>
      </div>
    </div>
  );
};

export default ProgressOverviewCard;
