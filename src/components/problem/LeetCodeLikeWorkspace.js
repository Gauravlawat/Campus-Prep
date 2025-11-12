'use client';
import {
  React,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { useTheme } from '@/context/ThemeContext';
import Editor from '@monaco-editor/react';

// Default snippets as a fallback
const DEFAULT_LANG_SNIPPETS = {
  'C++': `class Solution {
public:
    // Your code here
};`,
  'Java': `class Solution {
    // Your code here
}`,
  'Python': `class Solution:
    # Your code here`,
  'JavaScript': `// Your code here`,
};

export default function LeetCodeLikeWorkspace({ problem }) {
  const { theme } = useTheme() || { theme: 'light' };

  const LANGUAGE_MAP = {
    'C++': 'cpp',
    'Java': 'java',
    'Python': 'python',
    'JavaScript': 'javascript',
  };

  const langSnippets = useMemo(() => {
    if (!problem?.starterCode) return DEFAULT_LANG_SNIPPETS;
    const snippets = problem.starterCode.reduce((acc, snippet) => {
      acc[snippet.language] = snippet.code;
      return acc;
    }, {});
    return { ...DEFAULT_LANG_SNIPPETS, ...snippets };
  }, [problem]);

  const initialCases = useMemo(() => {
    const list = Array.isArray(problem?.examples) ? problem.examples : [];
    return list.map((ex, i) => ({ id: i + 1, name: `Case ${i + 1}`, ...ex }));
  }, [problem?.examples]);

  const containerRef = useRef(null);
  const dragging = useRef(false);
  const vDragging = useRef(false);
  const [leftPct, setLeftPct] = useState(() => {
    if (typeof window === 'undefined') return 48;
    const saved = Number(localStorage.getItem('cp:split:leftPct'));
    return Number.isFinite(saved) ? Math.min(80, Math.max(20, saved)) : 48;
  });
  const [editorHeightPct, setEditorHeightPct] = useState(() => {
    if (typeof window === 'undefined') return 60;
    const saved = Number(localStorage.getItem('cp:split:editorHeightPct'));
    return Number.isFinite(saved) ? Math.min(85, Math.max(35, saved)) : 60;
  });
  const [activeLeftTab, setActiveLeftTab] = useState('Description');
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'C++';
    return localStorage.getItem(`cp:lang:${problem?.problemId}`) || 'C++';
  });
  const [code, setCode] = useState(() => {
    if (typeof window === 'undefined') return langSnippets['C++'] || '';
    const key = `cp:code:${problem?.problemId}:${localStorage.getItem(`cp:lang:${problem?.problemId}`) || 'C++'}`;
    return localStorage.getItem(key) || langSnippets['C++'] || '';
  });
  const [cases, setCases] = useState(initialCases);
  const [activeCase, setActiveCase] = useState(1);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === 'undefined') return 14;
    const saved = Number(localStorage.getItem('cp:editor:fontSize'));
    return Number.isFinite(saved) ? Math.min(24, Math.max(10, saved)) : 14;
  });
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  // When language changes, load saved code or starter code
  useEffect(() => {
    const key = `cp:code:${problem?.problemId}:${lang}`;
    const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : '';
    setCode(saved || langSnippets[lang] || DEFAULT_LANG_SNIPPETS[lang]);
    if (typeof window !== 'undefined') localStorage.setItem(`cp:lang:${problem?.problemId}`, lang);
  }, [lang, langSnippets, problem?.problemId]);

  // Persist code as user types
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = `cp:code:${problem?.problemId}:${lang}`;
    localStorage.setItem(key, code || '');
  }, [code, lang, problem?.problemId]);

  // Persist layout prefs
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('cp:split:leftPct', String(leftPct)); }, [leftPct]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('cp:split:editorHeightPct', String(editorHeightPct)); }, [editorHeightPct]);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('cp:editor:fontSize', String(fontSize)); }, [fontSize]);

  const handleRun = useCallback(async () => {
    if (!problem) return;
    setRunning(true);
    setOutput(null);
    try {
      const payload = {
        code,
        language: LANGUAGE_MAP[lang] || lang,
        inputs: useCustomInput
          ? [{ input: customInput, expected: '' }]
          : cases.map((c) => ({ input: c.input, expected: c.output })),
        mode: useCustomInput ? 'custom' : 'test',
        problemId: problem.problemId,
      };
      const response = await axios.post('/api/execute/code', payload);
      setOutput(response.data);
    } catch (error) {
        console.error("Error running code:", error);
        setOutput({ errors: error.response?.data?.message || error.message || 'An unknown error occurred.' });
    }
    setRunning(false);
  }, [problem, code, lang, cases, customInput, useCustomInput]);

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 's') e.preventDefault();
      if (meta && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleRun]);

  const [stacked, setStacked] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 1024;
  });
  useEffect(() => {
    const onResize = () => setStacked(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onMove = (clientX) => {
      if (!dragging.current || !containerRef.current || stacked) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(clientX - rect.left, rect.width * 0.2), rect.width * 0.8);
      const pct = (x / rect.width) * 100;
      setLeftPct(Math.round(pct));
    };
    const handleMouseMove = (e) => onMove(e.clientX);
    const handleTouchMove = (e) => onMove(e.touches[0].clientX);
    const stop = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, [stacked]);

  const startDrag = (e) => {
    if (stacked) return;
    dragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const onMove = (clientY) => {
      if (!vDragging.current || !containerRef.current) return;
      const right = containerRef.current.querySelector('.right-pane');
      if (!right) return;
      const rect = right.getBoundingClientRect();
      const y = Math.min(Math.max(clientY - rect.top, rect.height * 0.35), rect.height * 0.85);
      const pct = (y / rect.height) * 100;
      setEditorHeightPct(Math.round(pct));
    };
    const handleMouseMove = (e) => onMove(e.clientY);
    const handleTouchMove = (e) => onMove(e.touches[0].clientY);
    const stop = () => {
      vDragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, []);

  const startVertical = () => {
    vDragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  };

  const handleSubmit = () => alert('Submit functionality not yet implemented.');

  const Tab = ({ label }) => (
    <button
      aria-pressed={activeLeftTab === label}
      onClick={() => setActiveLeftTab(label)}
      className={`tab ${activeLeftTab === label ? 'active' : ''}`}
    >
      {label}
    </button>
  );

  const CaseTab = ({ id, name }) => (
    <button
      className={`case-tab ${activeCase === id ? 'active' : ''}`}
      onClick={() => setActiveCase(id)}
    >
      {name}
    </button>
  );

  const activeCaseObj = cases.find(c => c.id === activeCase);
  const difficultyClass = problem.difficulty?.toLowerCase() || '';
  const difficultyFormatted = problem.difficulty ? `${problem.difficulty.charAt(0).toUpperCase()}${problem.difficulty.slice(1)}` : '';

  return (
    <div ref={containerRef} className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#0f131a]' : 'bg-gray-50'} text-gray-900 dark:text-gray-100 transition-colors`}>      
      <div className="h-12 flex items-center px-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-[#0f131a]/90 backdrop-blur-sm">
        <nav className="flex items-center text-sm gap-2">
          <span className="text-gray-600 dark:text-gray-400">Problems</span>
          <span className="text-gray-400 dark:text-gray-600">/</span>
          <span className="font-medium line-clamp-1 max-w-[320px]">{problem.title}</span>
        </nav>
      </div>

      <main className={`flex-1 grid ${stacked ? 'grid-cols-1' : 'grid-cols-[var(--left)_6px_var(--right)]'}`} style={!stacked ? { ['--left']: `${leftPct}%`, ['--right']: `${100 - leftPct}%` } : undefined}>
        {/* Left pane */}
        <section className="flex flex-col min-h-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121821]">
          {/* Tabs */}
          <div className="sticky top-12 z-20 bg-white/95 dark:bg-[#121821]/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <ul role="tablist" className="flex text-sm font-medium">
              {['Description','Editorial','Solutions','Submissions'].map(t => (
                <li key={t}>
                  <button onClick={() => setActiveLeftTab(t)} className={`px-4 py-2 border-b-2 -mb-px transition-colors ${activeLeftTab===t ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}>{t}</button>
                </li>
              ))}
            </ul>
          </div>
          <div className="overflow-y-auto px-5 py-6 space-y-8">
            {activeLeftTab==='Description' && (
              <article className="space-y-6">
                <header className="space-y-3">
                  <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">{problem.title}</h1>
                  {difficultyFormatted && (
                    <Badge className={`px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${difficultyClass==='easy'?'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400':difficultyClass==='medium'?'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400':'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>{difficultyFormatted}</Badge>
                  )}
                </header>
                <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed [&_code]:text-pink-600 dark:[&_code]:text-pink-400" dangerouslySetInnerHTML={{ __html: problem.description }} />
                <section className="space-y-4">
                  {problem.examples.map((ex,i)=>(
                    <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 shadow-sm">
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><span className="inline-block w-1.5 h-4 bg-blue-600 dark:bg-blue-500 rounded"/>Example {i+1}</h3>
                      <div className="text-xs space-y-1 font-mono">
                        <p><span className="font-semibold">Input:</span> <code className="whitespace-pre-wrap">{ex.input}</code></p>
                        <p><span className="font-semibold">Output:</span> <code className="whitespace-pre-wrap">{ex.output}</code></p>
                        {ex.explanation && <p><span className="font-semibold">Explanation:</span> {ex.explanation}</p>}
                      </div>
                    </div>
                  ))}
                </section>
              </article>
            )}
          </div>
        </section>
        {/* Divider */}
        {!stacked && (
          <div onMouseDown={startDrag} onTouchStart={startDrag} className="cursor-col-resize bg-gray-200 dark:bg-gray-800 hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors" />
        )}
        {/* Right pane */}
        <section className="flex flex-col min-h-0 bg-white dark:bg-[#121821]">
          {/* Toolbar */}
          <div className="sticky top-12 z-30 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white via-white to-gray-50 dark:from-[#121821] dark:via-[#121821] dark:to-[#1a222d] backdrop-blur-sm px-3 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select value={lang} onChange={(e)=>setLang(e.target.value)} aria-label="Language" className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.keys(langSnippets).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={()=>setFontSize(s=>Math.max(10,s-1))}>A-</Button>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-center">{fontSize}px</span>
                <Button variant="secondary" size="sm" onClick={()=>setFontSize(s=>Math.min(24,s+1))}>A+</Button>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={()=>setFullscreen(f=>!f)} aria-pressed={fullscreen}>{fullscreen?'Exit':'Fullscreen'}</Button>
              <Button variant="ghost" size="sm" onClick={()=>navigator.clipboard?.writeText(code)}>Copy</Button>
              <Button variant="ghost" size="sm" onClick={()=>{const blob=new Blob([code],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${problem?.problemId||'solution'}.${(LANGUAGE_MAP[lang]||'txt')}`;a.click();URL.revokeObjectURL(a.href);}}>Download</Button>
              <Button variant="outline" size="sm" onClick={()=>setCode(langSnippets[lang]||'')}>Reset</Button>
              <Button variant="secondary" size="sm" disabled={running} onClick={handleRun}>{running?'Running…':'Run (Ctrl+Enter)'}</Button>
              <Button size="sm" onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
          {/* Editor */}
          <div className={`relative ${fullscreen?'fixed inset-0 top-12 z-40':''} flex flex-col`} style={{height: fullscreen?'calc(100dvh - 3rem)':`${editorHeightPct}%`}}>
            <div className="flex-1 border-b border-gray-200 dark:border-gray-800 bg-[#0b1020]">
              <Editor
                height="100%"
                language={LANGUAGE_MAP[lang]||'javascript'}
                value={code}
                onChange={(v)=>setCode(v||'')}
                theme={theme==='dark'?'vs-dark':'light'}
                options={{
                  automaticLayout:true,
                  minimap:{enabled:false},
                  fontSize,
                  scrollBeyondLastLine:false,
                  smoothScrolling:true,
                  lineNumbers:'on',
                  padding:{top:12,bottom:12},
                  wordWrap:'on',
                  fontLigatures:true,
                  tabSize:2,
                  insertSpaces:true,
                  detectIndentation:true,
                  quickSuggestions:true,
                  formatOnPaste:true,
                }}
              />
            </div>
            {!fullscreen && <div onMouseDown={startVertical} onTouchStart={startVertical} className="h-2 bg-gray-200 dark:bg-gray-800 cursor-row-resize hover:bg-blue-400 dark:hover:bg-blue-500 transition-colors" />}
          </div>
          {!fullscreen && (
            <div className="flex flex-col overflow-hidden" style={{height:`${100-editorHeightPct}%`}}>
              <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-800 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-2">
                  {cases.map(c => (
                    <button key={c.id} onClick={()=>setActiveCase(c.id)} className={`px-3 py-1 rounded-md text-xs font-medium border transition ${activeCase===c.id?'bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500':'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}>{c.name}</button>
                  ))}
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={useCustomInput} onChange={e=>setUseCustomInput(e.target.checked)} className="accent-blue-600" />
                    Use custom input
                  </label>
                  {useCustomInput && (
                    <textarea value={customInput} onChange={e=>setCustomInput(e.target.value)} rows={4} placeholder="Enter custom input..." className="w-full text-xs font-mono rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  )}
                  {!useCustomInput && activeCaseObj && (
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1"><p className="font-semibold">Input</p><pre className="p-2 rounded-md bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-mono">{activeCaseObj.input}</pre></div>
                      <div className="space-y-1"><p className="font-semibold">Expected Output</p><pre className="p-2 rounded-md bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-mono">{activeCaseObj.output}</pre></div>
                    </div>
                  )}
                </div>
                {output && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Test Result</h3>
                    {output.errors && <pre className="text-xs font-mono p-3 rounded-md bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-600 text-rose-600 dark:text-rose-400 whitespace-pre-wrap">Error: {output.errors}</pre>}
                    {Array.isArray(output.output) && output.output.map((r,i)=>(
                      <div key={i} className={`p-3 rounded-md border text-xs space-y-1 ${r.passed?'border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-600':'border-rose-300 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-600'}`}>
                        <p className="font-semibold">Case {i+1}: {r.passed? <span className="text-emerald-600 dark:text-emerald-400">Passed</span>: <span className="text-rose-600 dark:text-rose-400">Failed</span>}</p>
                        {'input' in r && <p><span className="font-medium">Input:</span> {String(r.input)}</p>}
                        {'output' in r && <p><span className="font-medium">Your Output:</span> {String(r.output)}</p>}
                        {r.stderr && <p className="text-rose-600 dark:text-rose-400"><span className="font-medium">Error:</span> {String(r.stderr)}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}