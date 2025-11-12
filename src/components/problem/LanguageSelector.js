import React from 'react';

const LanguageSelector = ({ language, setLanguage }) => {
    return (
        <div className="flex items-center mb-2">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
