import React from 'react';
import { Circle, Timer, Target } from 'lucide-react';

const ProblemsList = ({ problems, onProblemSelect }) => {
  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-3">Track Questions</h2>
      <div className="flex-grow overflow-y-auto">
        <div className="space-y-2">
          {problems?.map((problem) => {
            const accuracy = problem.statistics?.accuracyRate ?? null;
            const avgTime = problem.statistics?.averageTimeToSolve ?? null;
            return (
              <button
                key={problem._id || problem.problemId}
                className="w-full text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                onClick={() => onProblemSelect(problem)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{problem.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{problem.difficulty}</span>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                  {problem.companies?.[0] && (
                    <span className="inline-flex items-center gap-1"><Circle className="h-3 w-3" /> {problem.companies[0]}</span>
                  )}
                  {typeof accuracy === 'number' && (
                    <span className="inline-flex items-center gap-1"><Target className="h-3 w-3" /> {Math.round(accuracy)}% accuracy</span>
                  )}
                  {typeof avgTime === 'number' && (
                    <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> {Math.round(avgTime)} min avg</span>
                  )}
                </div>
              </button>
            );
          })}
          {!problems?.length && (
            <p className="text-sm text-gray-600 dark:text-gray-300">No questions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemsList;
