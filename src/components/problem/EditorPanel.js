import React from 'react';
import Editor from '@monaco-editor/react';
import LanguageSelector from './LanguageSelector';
import RunSubmitButtons from './RunSubmitButtons';

const EditorPanel = ({ language, setLanguage, code, setCode, handleRunCode, handleSubmit, running, submitting, output }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow flex flex-col">
                <LanguageSelector language={language} setLanguage={setLanguage} />
                <div className="flex-grow border rounded-lg overflow-hidden">
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                    />
                </div>
            </div>
            <div className="h-1/3 flex flex-col mt-4">
                <RunSubmitButtons handleRunCode={handleRunCode} handleSubmit={handleSubmit} running={running} submitting={submitting} />
                <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Output</h3>
                    {output ? (
                        <div>
                            {output.errors && <pre className="text-red-500 whitespace-pre-wrap">{output.errors}</pre>}
                            {output.output && output.output.map((result, index) => (
                                <div key={index} className="mb-2">
                                    <p className="font-bold">Case {index + 1}: {result.passed ? <span className="text-green-500">Passed</span> : <span className="text-red-500">Failed</span>}</p>
                                    <p><span className="font-semibold">Input:</span> <pre className="inline whitespace-pre-wrap">{result.input}</pre></p>
                                    <p><span className="font-semibold">Your Output:</span> <pre className="inline whitespace-pre-wrap">{result.output}</pre></p>
                                    {result.stderr && <p><span className="font-semibold">Error:</span> <pre className="text-red-500 inline whitespace-pre-wrap">{result.stderr}</pre></p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Run the code to see the output here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorPanel;
