import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronLeft, ChevronRight, Tags, Flame, CheckCircle2 } from 'lucide-react';

const DifficultyBadge = ({ value }) => {
  const v = (value || '').toLowerCase();
  if (v === 'easy') return (<Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200">Easy</Badge>);
  if (v === 'medium') return (<Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200">Medium</Badge>);
  if (v === 'hard') return (<Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200">Hard</Badge>);
  return (<Badge variant="secondary">Unknown</Badge>);
};

const SkeletonRow = () => (
  <div className="animate-pulse grid grid-cols-12 items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
    <div className="col-span-6 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
    <div className="col-span-2 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
    <div className="col-span-3 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
    <div className="col-span-1 h-8 bg-gray-200 dark:bg-gray-800 rounded" />
  </div>
);

export default function AllProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');

  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      try {
        // Prefer server pagination if your API supports it; here we fetch all and paginate client-side for simplicity
        const res = await fetch('/api/problems');
        const { data } = await res.json();
        setProblems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch problems', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return problems.filter((p) => {
      const okSearch = !q || p.title?.toLowerCase().includes(q) || p.topics?.join(',').toLowerCase().includes(q);
      const okDiff = difficulty === 'all' || (p.difficulty || '').toLowerCase() === difficulty;
      return okSearch && okDiff;
    });
  }, [problems, search, difficulty]);

  // simple client-side pagination
  const pageSize = 30;
  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => setTotalPages(pages), [pages]);
  useEffect(() => { if (page > pages) setPage(1); }, [pages]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f131a] text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Problems</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Keep the streak going!</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems by title or topic..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#11161f] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={difficulty === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setDifficulty('all')}>
              <Filter className="h-4 w-4 mr-2" /> All
            </Button>
            <Button variant={difficulty === 'easy' ? 'default' : 'outline'} size="sm" onClick={() => setDifficulty('easy')}>
              Easy
            </Button>
            <Button variant={difficulty === 'medium' ? 'default' : 'outline'} size="sm" onClick={() => setDifficulty('medium')}>
              Medium
            </Button>
            <Button variant={difficulty === 'hard' ? 'default' : 'outline'} size="sm" onClick={() => setDifficulty('hard')}>
              Hard
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-t-lg bg-white dark:bg-[#0f131a] border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-3">Topics</div>
            <div className="col-span-1 text-right">Open</div>
          </div>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
          ) : paged.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No problems match your filters.</div>
          ) : (
            paged.map((q) => (
              <div key={q.problemId} className="grid grid-cols-12 items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                <div className="col-span-6 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-gray-300 dark:text-gray-600" />
                  <div>
                    <Link href={`/problems/${q.problemId}`} className="font-medium text-blue-700 dark:text-blue-400 hover:underline">
                      {q.title}
                    </Link>
                    {q.description ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{q.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="col-span-2">
                  <DifficultyBadge value={q.difficulty} />
                </div>
                <div className="col-span-3 flex flex-wrap gap-1">
                  {(q.topics || []).slice(0, 3).map((t, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      <Tags className="h-3 w-3 mr-1" /> {t}
                    </Badge>
                  ))}
                  {(q.topics || []).length > 3 && (
                    <Badge variant="secondary">+{(q.topics || []).length - 3}</Badge>
                  )}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button asChild size="sm">
                    <Link href={`/problems/${q.problemId}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
          </Button>
          <div className="text-sm text-gray-600 dark:text-gray-300">Page {page} of {totalPages}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </main>
    </div>
  );
}