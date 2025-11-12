import React from 'react';

const ProblemDescription = ({ problem }) => {
    if (!problem) return null;

    return (
        <div className="p-4 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg">
            <div className="mb-4">
                <p className="text-base text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: problem.description }}></p>
            </div>
            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Examples</h3>
                {problem.examples && problem.examples.map((example, index) => (
                    <div key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-2">
                        <p><span className="font-bold">Input:</span> <pre className="inline whitespace-pre-wrap">{example.input}</pre></p>
                        <p><span className="font-bold">Output:</span> <pre className="inline whitespace-pre-wrap">{example.output}</pre></p>
                        {example.explanation && <p><span className="font-bold">Explanation:</span> {example.explanation}</p>}
                    </div>
                ))}
            </div>
            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Constraints</h3>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {problem.constraints.inputConstraints && problem.constraints.inputConstraints.map((constraint, index) => (
                        <li key={index}>{constraint}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ProblemDescription;
