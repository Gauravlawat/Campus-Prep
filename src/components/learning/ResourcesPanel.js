import React, { useMemo, useState } from 'react';
import { ChevronDown, PlayCircle, FileText } from 'lucide-react';

const ResourcesPanel = ({ resources }) => {
  const [isOpen, setIsOpen] = useState(true);
  const { videos, notes, others } = useMemo(() => {
    const vids = [];
    const nts = [];
    const rest = [];
    (resources || []).forEach(r => {
      const type = (r.type || '').toLowerCase();
      if (type === 'video') vids.push(r);
      else if (type === 'notes' || type === 'article' || type === 'documentation') nts.push(r);
      else rest.push(r);
    });
    return { videos: vids, notes: nts, others: rest };
  }, [resources]);

  return (
    <div className="h-full flex flex-col">
      <button
        className="w-full flex justify-between items-center text-xl font-bold mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Resources</span>
        <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="space-y-6 overflow-y-auto pr-1">
          {videos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Video Lectures</h3>
              <div className="space-y-2">
                {videos.map((v, i) => (
                  <a key={i} href={v.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{v.title}</p>
                      {v.duration && <span className="text-xs text-gray-600 dark:text-gray-400">{v.duration} min</span>}
                    </div>
                    {v.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{v.description}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
          {notes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="h-4 w-4" /> Notes</h3>
              <div className="space-y-2">
                {notes.map((n, i) => (
                  <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{n.title}</p>
                    {n.description && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{n.description}</p>}
                  </a>
                ))}
              </div>
            </div>
          )}
          {others.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Other Resources</h3>
              <div className="space-y-2">
                {others.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="font-medium">{r.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{r.type}{r.duration ? ` • ${r.duration} min` : ''}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
          {videos.length === 0 && notes.length === 0 && others.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300">No resources yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourcesPanel;
