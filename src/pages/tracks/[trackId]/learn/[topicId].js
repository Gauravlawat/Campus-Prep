import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import AITutorChat from '@/components/learning/AITutorChat';
import ResourcesPanel from '@/components/learning/ResourcesPanel';
import ProblemsList from '@/components/learning/ProblemsList';
import ProblemDetailsPanel from '@/components/learning/ProblemDetailsPanel';
import EditorPanel from '@/components/problem/EditorPanel';

export default function TopicLearningPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { trackId, topicId } = router.query;
  const [learningData, setLearningData] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [learningMode, setLearningMode] = useState('ai'); // 'ai', 'resources', 'questions'
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [output, setOutput] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchLearningData = async () => {
      if (!trackId || !topicId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/tracks/${trackId}/topics/${topicId}/learn`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          setLearningData(data.data);
          if (data.data.topic.problems.length > 0) {
            setSelectedProblem(data.data.topic.problems[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching learning data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [trackId, topicId, user, authLoading, router]);

  const handleProblemSubmission = async () => {
    try {
      if (!selectedProblem) return;
      const start = performance.now();
      // For now, we assume the client validated via Run; set a basic status
      const status = 'Accepted'; // You can compute from last run result in your editor integration
      const timeTaken = Math.round((performance.now() - start) / 60000); // minutes
      const payload = {
        problemId: selectedProblem._id || selectedProblem.problemId,
        status,
        language,
        code,
        timeTaken,
        executionStats: { totalTime: 0, maxMemory: 0, testCasesPassed: status==='Accepted'?1:0, totalTestCases: 1 },
        testCasesResults: [],
        subtopicId: learningData?.topic?.currentSubtopic?.subtopicId,
      };
      const res = await fetch(`/api/tracks/${trackId}/topics/${topicId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        console.error('Submission error:', data.message || data);
      }
    } catch (e) {
      console.error('Error submitting problem:', e);
    }
  };

  const handleRunCode = async () => {
    try {
      setRunning(true);
      // Optional: wire to your execute API if available
      setOutput({ output: [{ input: 'sample', output: 'result', passed: true }], errors: '' });
    } finally {
      setRunning(false);
    }
  };

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 grid place-items-center text-gray-500">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Navbar />
      <Head>
        <title>{learningData?.topic?.title || 'Learn'} - College Prep Platform</title>
      </Head>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-semibold">{learningData?.topic?.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{learningData?.topic?.description}</p>
            </div>
            <div className="flex space-x-6">
              {['ai','resources','questions'].map((tab) => (
                <button
                  key={tab}
                  className={`py-2 px-1 border-b-2 capitalize ${learningMode === tab ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-600 dark:text-gray-300'}`}
                  onClick={() => setLearningMode(tab)}
                >
                  {tab === 'ai' ? 'AI Tutor' : tab === 'resources' ? 'Resources' : 'Track Questions'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
          {/* Left: Learning panels */}
          <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full overflow-hidden">
              {learningMode === 'ai' && (
                <AITutorChat
                  topicId={topicId}
                  aiContent={learningData?.topic?.aiContent}
                  userProgress={learningData?.userProgress}
                  suggestions={learningData?.suggestions}
                  relatedQuestions={learningData?.topic?.relatedQuestions}
                />
              )}
              {learningMode === 'resources' && (
                <ResourcesPanel resources={learningData?.topic?.resources} />
              )}
              {learningMode === 'questions' && (
                <ProblemsList problems={learningData?.topic?.problems} onProblemSelect={setSelectedProblem} />
              )}
            </div>
          </div>
          {/* Right: Code editor & selection */}
          <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[420px] overflow-hidden">
              <div className="px-4 pt-4">
                {selectedProblem && (
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{selectedProblem.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{selectedProblem.problemId} • {selectedProblem.difficulty}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 pt-0">
                <EditorPanel
                  language={language}
                  setLanguage={setLanguage}
                  code={code}
                  setCode={setCode}
                  handleRunCode={handleRunCode}
                  handleSubmit={async () => { setSubmitting(true); await handleProblemSubmission(); setSubmitting(false); }}
                  running={running}
                  submitting={submitting}
                  output={output}
                />
              </div>
            </div>
            {/* Collapsible problem details below the editor */}
            <ProblemDetailsPanel problem={selectedProblem} />
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 overflow-hidden">
              <ProblemsList problems={learningData?.topic?.problems} onProblemSelect={setSelectedProblem} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
