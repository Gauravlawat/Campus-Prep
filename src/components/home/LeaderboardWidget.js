import React from 'react';
import { Trophy } from 'lucide-react';

const Medal = ({ rank }) => {
  const map = {
    1: { bg: 'bg-amber-100 dark:bg-amber-900/20', fg: 'text-amber-600 dark:text-amber-400' },
    2: { bg: 'bg-gray-100 dark:bg-gray-700/40', fg: 'text-gray-600 dark:text-gray-300' },
    3: { bg: 'bg-orange-100 dark:bg-orange-900/20', fg: 'text-orange-600 dark:text-orange-400' },
  };
  const tone = map[rank] || { bg: 'bg-blue-100 dark:bg-blue-900/20', fg: 'text-blue-600 dark:text-blue-300' };
  return (
    <div className={`h-8 w-8 grid place-items-center rounded-full ${tone.bg}`}>
      <span className={`text-xs font-bold ${tone.fg}`}>{rank}</span>
    </div>
  );
};

const Avatar = ({ src, alt }) => (
  <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
    {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-gray-500">👤</div>}
  </div>
);

const Row = ({ ranker }) => (
  <div className="flex items-center gap-3 py-2">
    <Medal rank={ranker.rank} />
    <Avatar src={ranker.avatar} alt={ranker.name} />
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{ranker.name}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{ranker.score} pts</p>
    </div>
  </div>
);

const LeaderboardWidget = ({ leaderboard }) => {
  const top = leaderboard?.topRankers?.slice(0, 5) || [];
  const current = leaderboard?.topRankers?.find((r) => r.isCurrentUser) || { name: 'You', score: leaderboard?.userScore };
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2"><Trophy className="h-4 w-4 text-blue-600"/> Weekly Leaderboard</h2>
        <a href="/leaderboard" className="text-sm text-blue-700 dark:text-blue-300 hover:underline">View all</a>
      </div>
      <div className="space-y-1">
        {top.map((r) => (
          <Row key={r.userId || r.name} ranker={r} />
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <div className="h-8 w-8 grid place-items-center rounded-full bg-blue-100 dark:bg-blue-900/20"><span className="text-xs font-bold text-blue-600 dark:text-blue-300">{leaderboard?.userRank || '-'}</span></div>
        <Avatar src={current.avatar} alt="You" />
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">You</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{current.score || 0} pts</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardWidget;
