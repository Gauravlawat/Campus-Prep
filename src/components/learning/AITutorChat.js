import React from 'react';
import { Sparkles, MessageCircle, Lightbulb, ChevronRight } from 'lucide-react';

const AITutorChat = ({ topicId, aiContent, userProgress, suggestions, relatedQuestions }) => {
  const nextPrompt = suggestions?.nextPrompt || `Explain the key concept for this topic and show a simple example.`;
  const related = relatedQuestions || [];
  const progressPct = Math.round(userProgress?.currentTopicProgress || 0);

  return (
    <div className="h-full flex flex-col">
      {/* Header with progress and suggested next prompt */}
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">AI Tutor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Guided learning for faster understanding</p>
          </div>
          <div className="w-48">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Session Progress</div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-right text-xs text-gray-600 dark:text-gray-300 mt-1">{progressPct}%</div>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg">
          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <div className="text-sm text-gray-800 dark:text-gray-100">Suggested next question</div>
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">{nextPrompt}</div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">A</div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{aiContent?.introduction || 'Welcome! Ask me anything about this topic and I’ll guide you through concepts, pitfalls, and problem-solving strategies.'}</p>
          </div>
        </div>
      </div>

      {/* Related questions and input */}
      <div className="px-6 pb-6 space-y-3">
        {related.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-2">Related questions</div>
            <div className="flex flex-wrap gap-2">
              {related.slice(0, 6).map((q) => (
                <button key={q.problemId || q._id} className="group inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <MessageCircle className="h-3.5 w-3.5 text-gray-500 group-hover:text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">{q.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a question about this topic…"
            className="flex-1 p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm"
          />
          <button className="inline-flex items-center gap-2 px-3 h-9 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            <Sparkles className="h-4 w-4" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;
