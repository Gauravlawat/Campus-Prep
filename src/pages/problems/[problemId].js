
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import LeetCodeLikeWorkspace from '@/components/problem/LeetCodeLikeWorkspace';

const ProblemPage = () => {
    const router = useRouter();
    const { problemId } = router.query;
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        if (problemId) {
            const fetchProblem = async () => {
                setLoading(true);
                try {
                    const res = await fetch(`/api/problems/${problemId}`);
                    const { data } = await res.json();
                    setProblem(data);
                } catch (error) {
                    console.error("Failed to fetch problem", error);
                    setProblem(null); // Set problem to null on error
                }
                setLoading(false);
            };
            fetchProblem();
        }
    }, [problemId]);

    if (loading) {
        return <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}><div className="text-2xl font-bold">Loading Problem...</div></div>;
    }

    if (!problem) {
        return <div className={`flex justify-center items-center h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}><div className="text-2xl font-bold">Problem not found.</div></div>;
    }

    return <LeetCodeLikeWorkspace problem={problem} />;
};

export default ProblemPage;
