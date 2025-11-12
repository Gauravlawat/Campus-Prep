import React, { useState, useMemo } from 'react';
import { ChevronDown, BookOpen, ListChecks, Info } from 'lucide-react';

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="inline-flex items-center gap-2 font-medium">
          {Icon && <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          {title}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{children}</div>}
    </div>
  );
};

const ProblemDetailsPanel = ({ problem }) => {
  const hasContent = useMemo(() => !!(problem && (problem.description || problem.examples?.length || problem.constraints)), [problem]);
  if (!problem || !hasContent) return null;

  const examples = problem.examples || [];
  const constraints = problem.constraints || {};
  const inputConstraints = constraints.inputConstraints || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Problem Details</h3>
      </div>
      <div className="p-4 space-y-3">
        {problem.description && (
          <Section title="Description" icon={BookOpen} defaultOpen>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{problem.description}</div>
          </Section>
        )}

        {examples.length > 0 && (
          <Section title={`Examples (${examples.length})`} icon={ListChecks} defaultOpen>
            <div className="space-y-3">
              {examples.map((ex, idx) => (
                <div key={idx} className="rounded-md bg-gray-50 dark:bg-gray-900 p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs font-semibold mb-1">Example {idx + 1}</div>
                  {ex.input && (
                    <div className="text-xs"><span className="font-semibold">Input:</span> <pre className="inline whitespace-pre-wrap">{ex.input}</pre></div>
                  )}
                  {ex.output && (
                    <div className="text-xs"><span className="font-semibold">Output:</span> <pre className="inline whitespace-pre-wrap">{ex.output}</pre></div>
                  )}
                  {ex.explanation && (
                    <div className="text-xs mt-1 text-gray-700 dark:text-gray-300"><span className="font-semibold">Explanation:</span> <span className="whitespace-pre-wrap">{ex.explanation}</span></div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(constraints.timeLimit || constraints.memoryLimit || inputConstraints.length) && (
          <Section title="Constraints" icon={Info} defaultOpen={false}>
            <div className="space-y-1 text-xs">
              {constraints.timeLimit && (
                <div><span className="font-semibold">Time Limit:</span> {constraints.timeLimit} ms</div>
              )}
              {constraints.memoryLimit && (
                <div><span className="font-semibold">Memory Limit:</span> {constraints.memoryLimit} MB</div>
              )}
              {inputConstraints.length > 0 && (
                <div>
                  <div className="font-semibold">Input Constraints:</div>
                  <ul className="list-disc ml-5 mt-1 space-y-0.5">
                    {inputConstraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default ProblemDetailsPanel;
