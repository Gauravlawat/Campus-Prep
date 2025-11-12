import React from 'react';

const RunSubmitButtons = ({ handleRunCode, handleSubmit, running, submitting }) => {
    return (
        <div className="flex justify-end mb-2 space-x-2">
            <button
                onClick={handleRunCode}
                disabled={running}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
                {running ? 'Running...' : 'Run Code'}
            </button>
            <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
                {submitting ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
};

export default RunSubmitButtons;
