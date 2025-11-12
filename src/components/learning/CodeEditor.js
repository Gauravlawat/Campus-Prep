import React, { useState } from 'react';

const CodeEditor = ({ problem, onSubmission }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const handleRunTests = () => {
    // Placeholder for running tests
    console.log('Running tests for:', { code, language });
  };

  const handleSubmit = () => {
    onSubmission({ code, language });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{problem?.title}</h2>
        <select
          className="p-2 border rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className="flex-grow">
        <textarea
          className="w-full h-full p-2 border rounded font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
        />
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          onClick={handleRunTests}
        >
          Run Tests
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default CodeEditor;
