import React, { useMemo } from 'react';
import Link from 'next/link';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';

/**
 * TrackGraph
 * Props:
 * - track: { trackId, topics: [{ topicId, title, order, difficulty, isLocked, unlockCriteria, subtopics: [...] }] }
 * - progressByTopic?: Record<string, number> // 0-100 progress per topicId
 * - currentTopicId?: string
 */
export default function TrackGraph({ track, progressByTopic = {}, currentTopicId, metricsByTopic = {} }) {
  const topics = useMemo(() => {
    if (!track?.topics) return [];
    return [...track.topics].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [track]);

  if (!topics.length) {
    return (
      <div className="h-40 grid place-items-center text-sm text-gray-500 dark:text-gray-400">
        No topics defined for this track yet.
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto overflow-y-hidden">
      <div className="min-w-[720px]">
        <div className="relative flex items-center gap-8 py-6">
          {topics.map((t, idx) => (
            <React.Fragment key={t.topicId}>
              <TopicNode
                trackId={track.trackId}
                topic={t}
                progress={progressByTopic[t.topicId] ?? 0}
                isCurrent={currentTopicId === t.topicId}
                metrics={metricsByTopic[t.topicId]}
              />
              {idx !== topics.length - 1 && (
                <Connector />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function TopicNode({ trackId, topic, progress = 0, isCurrent, metrics }) {
  const locked = topic.isLocked;
  const pct = Math.max(0, Math.min(100, progress));
  const ring = {
    background: `conic-gradient(var(--ring-color) ${pct * 3.6}deg, var(--ring-bg) 0deg)`,
  };

  return (
    <Link
      href={locked ? '#' : `/tracks/${trackId}/learn/${topic.topicId}`}
      className={`group relative flex-shrink-0 w-52 select-none ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={(e) => {
        if (locked) e.preventDefault();
      }}
    >
      <div className={`rounded-xl border p-4 bg-white dark:bg-gray-800 transition shadow-sm hover:shadow-md
        border-gray-200 dark:border-gray-700 ${locked ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-3">
          <div
            className="relative h-12 w-12 rounded-full grid place-items-center"
            style={{
              ...ring,
              // Use CSS variables to make it theme-aware
              ['--ring-color']: pct >= 100 ? '#10b981' : '#3b82f6',
              ['--ring-bg']: 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="h-10 w-10 rounded-full grid place-items-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-semibold">
              {topic.order || '-'}
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{topic.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                {topic.difficulty || '—'}
              </span>
              {pct > 0 && (
                <span className="text-[11px] text-gray-500 dark:text-gray-400">{pct}%</span>
              )}
              {isCurrent && (
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
                  Current
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="truncate">
            {(topic?.subtopics?.length || 0)} subtopics
          </div>
          {locked ? (
            <div className="flex items-center gap-1 text-amber-600">
              <Lock size={14} />
              <span>Locked</span>
            </div>
          ) : pct >= 100 ? (
            <div className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={14} />
              <span>Done</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600">
              <span>Learn</span>
              <ChevronRight size={14} />
            </div>
          )}
        </div>

        {/* Metrics row */}
        {metrics && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
            <div className="rounded border border-gray-200 dark:border-gray-700 p-1.5 text-center">
              <div className="font-semibold">{metrics.accuracyPct ?? 0}%</div>
              <div className="opacity-70">Accuracy</div>
            </div>
            <div className="rounded border border-gray-200 dark:border-gray-700 p-1.5 text-center">
              <div className="font-semibold">{metrics.avgTimeMin ?? 0}m</div>
              <div className="opacity-70">Avg Time</div>
            </div>
            <div className="rounded border border-gray-200 dark:border-gray-700 p-1.5 text-center">
              <div className="font-semibold">{metrics.solvedProblems ?? 0}/{metrics.totalProblems ?? 0}</div>
              <div className="opacity-70">Problems</div>
            </div>
          </div>
        )}

        {/* Subtopics satellites */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(topic.subtopics || []).map((s) => (
            <span key={s.subtopicId} className="text-[10px] px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              {s.title.length > 18 ? s.title.slice(0,18)+'…' : s.title}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Connector() {
  return (
    <div className="relative h-px flex-1 -mx-2">
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-700" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>
  );
}
