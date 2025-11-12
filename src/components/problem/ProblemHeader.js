import React from 'react';

const ProblemHeader = ({ problem }) => {
    if (!problem) return null;

    const difficultyColor = {
        Easy: 'text-green-500',
        Medium: 'text-yellow-500',
        Hard: 'text-red-500',
    };

    return (
        <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{problem.title}</h1>
            <div className="flex items-center space-x-4">
                <span className={`${difficultyColor[problem.difficulty]} font-semibold`}>{problem.difficulty}</span>
                <span className="text-gray-500 dark:text-gray-400">Acceptance: {problem.userStats?.acceptanceRate}%</span>
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Solutions</button>
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md dark:text-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Submissions</button>
            </div>
        </div>
    );
};

export default ProblemHeader;
